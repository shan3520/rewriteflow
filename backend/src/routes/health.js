import { Hono } from 'hono'

/** GET /api/health — checks connectivity to Groq and Supabase. */
export function healthRoutes({ groq, repo, groqConfigured }) {
  const r = new Hono()

  r.get('/', async (c) => {
    const checks = { groq: false, supabase: false }

    if (repo) {
      try {
        checks.supabase = await repo.ping()
      } catch {
        checks.supabase = false
      }
    }

    if (groqConfigured) {
      try {
        await groq.models.list()
        checks.groq = true
      } catch {
        checks.groq = false
      }
    }

    const healthy = checks.groq && checks.supabase
    return c.json({ status: healthy ? 'healthy' : 'degraded', checks }, healthy ? 200 : 503)
  })

  return r
}
