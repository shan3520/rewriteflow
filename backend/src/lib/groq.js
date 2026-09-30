import { sleep, isAbortError } from './abort.js'

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export class RewriteError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'RewriteError'
    this.status = status
  }
}

// Returns rewriteParagraph(system, text, signal), which retries rate-limited
// calls with exponential backoff (2s, 4s) before giving up.
export function createRewriter(groq, { model = DEFAULT_MODEL, maxAttempts = 3, backoffMs = 1000, wait = sleep } = {}) {
  return async function rewriteParagraph(system, text, signal) {
    let attempts = 0
    while (true) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: text },
          ],
          temperature: 0.7,
        }, { signal })
        return completion.choices[0]?.message?.content?.trim() || text
      } catch (err) {
        if (isAbortError(err)) throw err
        attempts++
        if (err.status === 429 && attempts < maxAttempts) {
          const delay = backoffMs * Math.pow(2, attempts)
          console.warn(`Rate limited by Groq, retrying in ${delay}ms (attempt ${attempts}/${maxAttempts})`)
          await wait(delay, signal)
          continue
        }
        const kind = err.status === 429 ? 'Rate limit exceeded'
          : err.status === 401 ? 'Groq API key invalid'
          : 'AI processing error'
        throw new RewriteError(`${kind} after ${attempts} attempt(s). ${err.message}`, err.status)
      }
    }
  }
}
