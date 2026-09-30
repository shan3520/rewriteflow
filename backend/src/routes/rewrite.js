import { Hono } from 'hono'
import { validateRewriteBody } from '../middleware/validate.js'
import { resolveInstructions } from '../controllers/pipelineController.js'
import { ndjsonResponse } from '../services/streamEmitter.js'
import { sleep } from '../lib/abort.js'

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/**
 * POST /api/rewrite
 * Body: { text, mode? | workflowId? | steps? + custom_instruction?, options? }
 * Streams ndjson: progress → paragraph → … → result (or error).
 */
export function rewriteRoutes({ library, repo, rewriteParagraph, auth, limiter, quota, config }) {
  const r = new Hono()

  r.post('/', auth, limiter, async (c) => {
    const user = c.get('user')
    let body
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    const { value: request, error } = validateRewriteBody(library, body, config)
    if (error) return c.json({ error }, 400)

    if (!quota.consume(user.id, request.text.length)) {
      return c.json({ error: 'Daily character limit reached. It resets at midnight UTC.' }, 429)
    }

    const { system, mode, workflowName } = await resolveInstructions({ library, repo, userId: user.id, request })
    const paragraphs = request.text.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
    const total = paragraphs.length
    const signal = c.req.raw.signal

    return ndjsonResponse(signal, async (send) => {
      const rewritten = []
      for (let i = 0; i < total; i++) {
        if (!send({ type: 'progress', current: i + 1, total })) return
        let paragraph
        try {
          paragraph = await rewriteParagraph(system, paragraphs[i], signal)
        } catch (err) {
          if (err.name === 'AbortError') return
          send({ type: 'error', message: `Failed on paragraph ${i + 1}: ${err.message}` })
          return
        }
        rewritten.push(paragraph)
        if (!send({ type: 'paragraph', text: paragraph, current: i + 1, total })) return
        if (i < total - 1 && config.paragraphDelayMs > 0) await sleep(config.paragraphDelayMs, signal)
      }

      const rewrittenText = rewritten.join('\n\n')
      const row = {
        user_id: user.id,
        original_text: request.text,
        rewritten_text: rewrittenText,
        mode,
        original_word_count: countWords(request.text),
        rewritten_word_count: countWords(rewrittenText),
      }
      // Only send workflow_name when there is one, so mode rewrites still save
      // on databases that haven't run the workflows migration yet.
      if (workflowName) row.workflow_name = workflowName
      try {
        await repo.insertRewrite(row)
      } catch (dbErr) {
        console.error('DB save error:', dbErr)
      }

      send({
        type: 'result',
        rewritten_text: rewrittenText,
        original_word_count: row.original_word_count,
        rewritten_word_count: row.rewritten_word_count,
      })
    })
  })

  return r
}
