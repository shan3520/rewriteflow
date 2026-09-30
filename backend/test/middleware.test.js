import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Hono } from 'hono'
import { loadLibrary } from '../src/lib/library.js'
import { rateLimiter } from '../src/middleware/rateLimiter.js'
import { createDailyQuota, estimateTokens } from '../src/middleware/costEstimator.js'
import { validateRewriteBody, validateWorkflowBody } from '../src/middleware/validate.js'
import { createRewriter } from '../src/lib/groq.js'

const library = loadLibrary()
const cfg = { maxTextLength: 100 }

test('rate limiter allows max requests per window, then 429 with Retry-After', async () => {
  let now = 0
  const app = new Hono()
  app.use('*', async (c, next) => { c.set('user', { id: 'u1' }); await next() })
  app.use('*', rateLimiter({ max: 2, windowMs: 1000, now: () => now }))
  app.get('/', c => c.text('ok'))

  assert.equal((await app.request('/')).status, 200)
  assert.equal((await app.request('/')).status, 200)
  const blocked = await app.request('/')
  assert.equal(blocked.status, 429)
  assert.equal(blocked.headers.get('Retry-After'), '1')

  now = 1001
  assert.equal((await app.request('/')).status, 200)
})

test('daily quota blocks past the limit and resets on a new day', () => {
  let day = '2026-01-01'
  const quota = createDailyQuota(10, { today: () => day })
  assert.equal(quota.consume('u', 6), true)
  assert.equal(quota.consume('u', 5), false)
  assert.equal(quota.remaining('u'), 4)
  day = '2026-01-02'
  assert.equal(quota.consume('u', 10), true)
})

test('quota of 0 is disabled', () => {
  const quota = createDailyQuota(0)
  assert.equal(quota.enabled, false)
  assert.equal(quota.consume('u', 1e9), true)
})

test('estimateTokens is about 4 chars per token', () => {
  assert.equal(estimateTokens('abcdefgh'), 2)
})

test('rewrite body: defaults to standard mode', () => {
  const { value } = validateRewriteBody(library, { text: 'hi' }, cfg)
  assert.equal(value.mode, 'standard')
})

test('rewrite body: rejects bad input', () => {
  const bad = [
    [{}, /text is required/],
    [{ text: 'x'.repeat(101) }, /maximum length/],
    [{ text: 'hi', mode: 'nope' }, /Invalid mode/],
    [{ text: 'hi', mode: 'standard', workflowId: 'starter:email_polish' }, /only one/],
    [{ text: 'hi', workflowId: 'drop table' }, /Invalid workflowId/],
    [{ text: 'hi', steps: ['nope'] }, /Unknown step/],
    [{ text: 'hi', steps: [] }, /at least one step/],
    [{ text: 'hi', options: { length: 'huge' } }, /Invalid value/],
    [{ text: 'hi', steps: [{ id: 'translate', params: { color: 'red' } }] }, /Unknown param/],
  ]
  for (const [body, re] of bad) {
    assert.match(validateRewriteBody(library, body, cfg).error, re, JSON.stringify(body))
  }
})

test('rewrite body: inline steps become a custom workflow', () => {
  const { value } = validateRewriteBody(library, { text: 'hi', steps: ['grammar', { id: 'translate', params: { lang: ' German ' } }] }, cfg)
  assert.deepEqual(value.workflow.steps, [{ id: 'grammar' }, { id: 'translate', params: { lang: 'German' } }])
})

test('workflow body validation', () => {
  assert.match(validateWorkflowBody(library, { steps: ['grammar'] }).error, /name is required/)
  assert.match(validateWorkflowBody(library, { name: 'x', steps: Array(11).fill('grammar') }).error, /at most 10/)
  const { value } = validateWorkflowBody(library, { name: ' Mine ', steps: ['concise'], custom_instruction: ' Be brief ' })
  assert.deepEqual(value, { name: 'Mine', description: '', steps: [{ id: 'concise' }], custom_instruction: 'Be brief' })
})

test('rewriter retries 429 with backoff, then succeeds', async () => {
  let calls = 0
  const waits = []
  const groq = { chat: { completions: { create: async () => {
    calls++
    if (calls < 3) { const e = new Error('slow down'); e.status = 429; throw e }
    return { choices: [{ message: { content: ' done ' } }] }
  } } } }
  const rewrite = createRewriter(groq, { wait: async ms => { waits.push(ms) } })
  assert.equal(await rewrite('sys', 'text'), 'done')
  assert.deepEqual(waits, [2000, 4000])
})

test('rewriter gives a readable error on bad key', async () => {
  const groq = { chat: { completions: { create: async () => { const e = new Error('nope'); e.status = 401; throw e } } } }
  await assert.rejects(createRewriter(groq)('s', 't'), /Groq API key invalid/)
})
