// Rough token estimate for Llama-family tokenizers (about 4 characters per token).
export function estimateTokens(text) {
  return Math.ceil(text.length / 4)
}

// Optional per-user daily character budget, so one account can't burn the
// whole Groq quota. A limit of 0 disables it.
export function createDailyQuota(limit, { today = () => new Date().toISOString().slice(0, 10) } = {}) {
  const usage = new Map()

  return {
    enabled: limit > 0,
    remaining(userId) {
      if (limit <= 0) return Infinity
      const entry = usage.get(userId)
      return entry && entry.day === today() ? limit - entry.used : limit
    },
    consume(userId, chars) {
      if (limit <= 0) return true
      const day = today()
      const entry = usage.get(userId)
      const used = entry && entry.day === day ? entry.used : 0
      if (used + chars > limit) return false
      usage.set(userId, { day, used: used + chars })
      return true
    },
  }
}
