// Sliding-window rate limiter keyed per signed-in user (falls back to the
// client IP). In-memory, which is fine for a single backend instance.
export function rateLimiter({ max = 20, windowMs = 60_000, now = Date.now } = {}) {
  const hits = new Map()

  return async (c, next) => {
    if (max <= 0) return next()
    const key = c.get('user')?.id || c.req.header('x-forwarded-for') || 'anonymous'
    const t = now()
    const recent = (hits.get(key) || []).filter(ts => t - ts < windowMs)

    if (recent.length >= max) {
      const retryAfter = Math.ceil((windowMs - (t - recent[0])) / 1000)
      hits.set(key, recent)
      c.header('Retry-After', String(retryAfter))
      c.header('X-RateLimit-Limit', String(max))
      c.header('X-RateLimit-Remaining', '0')
      return c.json({ error: `Too many requests. Try again in ${retryAfter}s.` }, 429)
    }

    recent.push(t)
    hits.set(key, recent)
    c.header('X-RateLimit-Limit', String(max))
    c.header('X-RateLimit-Remaining', String(max - recent.length))
    await next()
  }
}
