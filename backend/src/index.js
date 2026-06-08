import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const app = new Hono()

// ── Configuration ──────────────────────────────────────────

const PORT = Number(process.env.PORT) || 3000
const MAX_TEXT_LENGTH = 50_000 // characters

// Parse allowed origins from env, fall back to localhost for dev
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173']

// CORS — only allow configured frontend origins
app.use('*', cors({
  origin: ALLOWED_ORIGINS,
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path
  await next()
  const duration = Date.now() - start
  const status = c.res.status
  console.log(`${method} ${path} → ${status} (${duration}ms)`)
})

// Supabase admin client (service role — bypasses RLS)
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!SUPABASE_URL.startsWith('http')) {
  console.warn('⚠️  SUPABASE_URL not configured — set it in .env')
}
const supabase = SUPABASE_URL.startsWith('http')
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

// Groq client
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key') {
  console.warn('⚠️  GROQ_API_KEY not configured — set it in .env')
}
const groq = new Groq({ apiKey: GROQ_API_KEY })

// ── Helpers ────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  standard: 'You are a professional writing and paraphrasing expert. Rewrite the following text to ensure originality while preserving the original meaning exactly. Use fresh vocabulary and varied sentence structures. Output only the rewritten text, nothing else.',
  academic: 'You are an academic writing expert. Rewrite the following text in a formal scholarly tone to remove plagiarism. Use academic vocabulary, varied sentence structures, and formal conventions. Output only the rewritten text, nothing else.',
  aggressive: 'You are a paraphrasing expert. Completely restructure the following text to ensure it is entirely original. Change word order, use synonyms extensively, and restructure every sentence. The result must share zero phrases with the original. Output only the rewritten text, nothing else.',
  simplified: 'You are a clear-writing expert. Rewrite the following text in simple, plain English to ensure originality. Use short sentences and everyday vocabulary while keeping all the same information. Output only the rewritten text, nothing else.',
  creative: 'You are a creative writing expert. Rewrite the following text in a fresh, engaging, and original way. Keep the core meaning but express it with creativity and flair. Output only the rewritten text, nothing else.',
}

function createAbortError() {
  const error = new Error('Request aborted')
  error.name = 'AbortError'
  return error
}

function isAbortError(error) {
  return error?.name === 'AbortError'
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }

    const timeout = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    const onAbort = () => {
      cleanup()
      reject(createAbortError())
    }

    const cleanup = () => {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', onAbort)
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/** Verify Supabase JWT and return { user, error } */
async function verifyToken(authHeader) {
  if (!supabase) return { user: null, error: 'Supabase not configured' }
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing authorization token' }
  }
  const token = authHeader.replace('Bearer ', '').trim()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { user: null, error: 'Invalid or expired token' }
  return { user, error: null }
}

// ── Routes ─────────────────────────────────────────────────

app.get('/', (c) => c.json({ status: 'ok', service: 'RewriteAI API' }))

/**
 * GET /api/health
 * Validates connectivity to Groq and Supabase
 */
app.get('/api/health', async (c) => {
  const checks = { groq: false, supabase: false }

  // Check Supabase
  if (supabase) {
    try {
      const { error } = await supabase.from('users').select('id').limit(1)
      checks.supabase = !error
    } catch {
      checks.supabase = false
    }
  }

  // Check Groq (lightweight — just verify the key works)
  try {
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key') {
      await groq.models.list()
      checks.groq = true
    }
  } catch {
    checks.groq = false
  }

  const healthy = checks.groq && checks.supabase
  return c.json({ status: healthy ? 'healthy' : 'degraded', checks }, healthy ? 200 : 503)
})

/**
 * POST /api/rewrite
 * Streams ndjson progress + result
 */
app.post('/api/rewrite', async (c) => {
  const { user, error: authError } = await verifyToken(c.req.header('Authorization'))
  if (authError) return c.json({ error: authError }, 401)
  const requestSignal = c.req.raw.signal

  let body
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { text, mode = 'standard' } = body
  if (!text || typeof text !== 'string' || !text.trim()) {
    return c.json({ error: 'text is required' }, 400)
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return c.json({ error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH.toLocaleString()} characters` }, 400)
  }
  if (!SYSTEM_PROMPTS[mode]) {
    return c.json({ error: `Invalid mode: ${mode}` }, 400)
  }

  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  const total = paragraphs.length

  return new Response(
    new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder()
        const closeStream = () => {
          try {
            controller.close()
          } catch {}
        }
        const send = (obj) => {
          if (requestSignal?.aborted) return false
          controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'))
          return true
        }

        const rewrittenParagraphs = []

        for (let i = 0; i < paragraphs.length; i++) {
          if (requestSignal?.aborted) {
            closeStream()
            return
          }

          let attempts = 0
          const maxAttempts = 3
          let success = false

          while (attempts < maxAttempts && !success) {
            try {
              if (!send({ type: 'progress', current: i + 1, total })) return

              const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPTS[mode] },
                  { role: 'user', content: paragraphs[i] },
                ],
                temperature: 0.7,
              }, { signal: requestSignal })

              const rewritten = completion.choices[0]?.message?.content?.trim() || paragraphs[i]
              rewrittenParagraphs.push(rewritten)
               
              // Stream the completed paragraph
              if (!send({ type: 'paragraph', text: rewritten, current: i + 1, total })) return
               
              success = true
               
              // Rate limit: 500ms delay between calls (except last)
              if (i < paragraphs.length - 1) await sleep(500, requestSignal)
            } catch (err) {
              if (isAbortError(err)) {
                closeStream()
                return
              }

              attempts++
              if (err.status === 429 && attempts < maxAttempts) {
                // Rate limit — exponential backoff
                const backoffMs = 1000 * Math.pow(2, attempts)
                console.warn(`Rate limited on paragraph ${i + 1}, retrying in ${backoffMs}ms (attempt ${attempts}/${maxAttempts})`)
                try {
                  await sleep(backoffMs, requestSignal)
                } catch (sleepErr) {
                  if (isAbortError(sleepErr)) {
                    closeStream()
                    return
                  }
                  throw sleepErr
                }
                continue
              }
              const errType = err.status === 429 ? 'Rate limit exceeded' : err.status === 401 ? 'Groq API key invalid' : 'AI processing error'
              send({ type: 'error', message: `${errType}: Failed on paragraph ${i + 1} after ${attempts} attempt(s). ${err.message}` })
              closeStream()
              return
            }
          }
        }

        if (requestSignal?.aborted) {
          closeStream()
          return
        }

        const originalText = text
        const rewrittenText = rewrittenParagraphs.join('\n\n')
        const originalWordCount = countWords(originalText)
        const rewrittenWordCount = countWords(rewrittenText)

        // Save to database
        try {
          const { error: insertError } = await supabase.from('rewrites').insert({
            user_id: user.id,
            original_text: originalText,
            rewritten_text: rewrittenText,
            mode,
            original_word_count: originalWordCount,
            rewritten_word_count: rewrittenWordCount,
          })
          if (insertError) {
            throw insertError
          }
        } catch (dbErr) {
          console.error('DB save error:', dbErr)
        }

        if (!send({
          type: 'result',
          rewritten_text: rewrittenText,
          original_word_count: originalWordCount,
          rewritten_word_count: rewrittenWordCount,
        })) return

        closeStream()
      }
    }),
    {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    }
  )
})

/**
 * GET /api/history
 */
app.get('/api/history', async (c) => {
  const { user, error: authError } = await verifyToken(c.req.header('Authorization'))
  if (authError) return c.json({ error: authError }, 401)

  const { data, error } = await supabase
    .from('rewrites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ rewrites: data })
})

/**
 * DELETE /api/history/:id
 */
app.delete('/api/history/:id', async (c) => {
  const { user, error: authError } = await verifyToken(c.req.header('Authorization'))
  if (authError) return c.json({ error: authError }, 401)

  const id = c.req.param('id')

  // Ensure the record belongs to this user
  const { data: existing, error: lookupError } = await supabase
    .from('rewrites')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (lookupError) return c.json({ error: lookupError.message }, 500)

  if (!existing) return c.json({ error: 'Not found or unauthorized' }, 404)

  const { error } = await supabase.from('rewrites').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)

  return c.json({ success: true })
})

// ── Start server ───────────────────────────────────────────

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`🚀 RewriteAI backend running at http://localhost:${info.port}`)
  console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
})

// Graceful shutdown for container environments (Render, Docker)
function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully…`)
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
  // Force exit after 10s if connections don't close
  setTimeout(() => process.exit(1), 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
