import 'dotenv/config'
import { serve } from '@hono/node-server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'
import { createApp, DEFAULT_CONFIG } from './app.js'

const PORT = Number(process.env.PORT) || 3000

// Parse allowed origins from env, fall back to localhost for dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : DEFAULT_CONFIG.allowedOrigins

// Supabase admin client (service role — bypasses RLS)
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!SUPABASE_URL.startsWith('http')) {
  console.warn('⚠️  SUPABASE_URL not configured — set it in .env')
}
const supabase = SUPABASE_URL.startsWith('http') ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

// Groq client. GROQ_BASE_URL is only needed to point at a local mock.
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const groqConfigured = Boolean(GROQ_API_KEY) && GROQ_API_KEY !== 'your_groq_api_key'
if (!groqConfigured) {
  console.warn('⚠️  GROQ_API_KEY not configured — set it in .env')
}
const groq = new Groq({ apiKey: GROQ_API_KEY || 'missing', baseURL: process.env.GROQ_BASE_URL || undefined })

const envNumber = (name, fallback) => (process.env[name] !== undefined ? Number(process.env[name]) : fallback)

const app = createApp({
  groq,
  supabase,
  config: {
    allowedOrigins,
    groqConfigured,
    logRequests: true,
    model: process.env.GROQ_MODEL || DEFAULT_CONFIG.model,
    rateLimitPerMinute: envNumber('RATE_LIMIT_PER_MINUTE', DEFAULT_CONFIG.rateLimitPerMinute),
    dailyCharLimit: envNumber('DAILY_CHAR_LIMIT', DEFAULT_CONFIG.dailyCharLimit),
  },
})

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`🚀 RewriteFlow backend running at http://localhost:${info.port}`)
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`)
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
