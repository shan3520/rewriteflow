import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { loadLibrary } from './lib/library.js'
import { createRewriter, DEFAULT_MODEL } from './lib/groq.js'
import { createRepository } from './db/repository.js'
import { requireAuth } from './middleware/auth.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { createDailyQuota } from './middleware/costEstimator.js'
import { errorHandler } from './middleware/errorHandler.js'
import { healthRoutes } from './routes/health.js'
import { rewriteRoutes } from './routes/rewrite.js'
import { historyRoutes } from './routes/history.js'
import { pipelineRoutes } from './routes/pipelines.js'

export const DEFAULT_CONFIG = {
  allowedOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
  maxTextLength: 50_000,
  paragraphDelayMs: 500,
  rateLimitPerMinute: 20,
  dailyCharLimit: 0,
  model: DEFAULT_MODEL,
  groqConfigured: true,
}

/** Builds the Hono app. Dependencies are injected so tests can use fakes. */
export function createApp({ groq, supabase, config: overrides = {}, library = loadLibrary(), rewriteParagraph } = {}) {
  const config = { ...DEFAULT_CONFIG, ...overrides }
  const repo = supabase ? createRepository(supabase) : null
  const auth = requireAuth(supabase)
  const limiter = rateLimiter({ max: config.rateLimitPerMinute })
  const quota = createDailyQuota(config.dailyCharLimit)
  rewriteParagraph ??= createRewriter(groq, { model: config.model })

  const app = new Hono()

  app.use('*', cors({
    origin: config.allowedOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Retry-After', 'X-RateLimit-Remaining'],
  }))

  if (config.logRequests) {
    app.use('*', async (c, next) => {
      const start = Date.now()
      await next()
      console.log(`${c.req.method} ${c.req.path} → ${c.res.status} (${Date.now() - start}ms)`)
    })
  }

  app.onError(errorHandler)

  app.get('/', (c) => c.json({ status: 'ok', service: 'RewriteFlow API' }))
  app.route('/api/health', healthRoutes({ groq, repo, groqConfigured: config.groqConfigured }))
  app.route('/api/rewrite', rewriteRoutes({ library, repo, rewriteParagraph, auth, limiter, quota, config }))
  app.route('/api/history', historyRoutes({ repo, auth }))
  app.route('/api', pipelineRoutes({ library, repo, auth }))

  return app
}
