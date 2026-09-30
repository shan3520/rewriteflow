import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { createFakeSupabase, createFakeGroq } from './fakeSupabase.js'

function setup(config = {}) {
  const supabase = createFakeSupabase()
  const groq = createFakeGroq()
  const app = createApp({ groq, supabase, config: { paragraphDelayMs: 0, ...config } })
  return { app, supabase, groq }
}

const auth = (token = 'token-alice') => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

async function readNdjson(res) {
  return (await res.text()).trim().split('\n').map(l => JSON.parse(l))
}

test('GET / and /api/steps are public', async () => {
  const { app } = setup()
  assert.equal((await app.request('/')).status, 200)
  const res = await app.request('/api/steps')
  const body = await res.json()
  assert.ok(body.steps.find(s => s.id === 'grammar'))
  assert.deepEqual(body.options.length, ['shorter', 'same', 'longer'])
  assert.equal(body.modes.academic, 'Professional')
})

test('GET /api/workflows/starters lists presets', async () => {
  const { app } = setup()
  const { workflows } = await (await app.request('/api/workflows/starters')).json()
  assert.ok(workflows.find(w => w.id === 'starter:email_polish'))
})

test('rewrite requires auth', async () => {
  const { app } = setup()
  assert.equal((await app.request('/api/rewrite', { method: 'POST', body: '{}' })).status, 401)
  const bad = await app.request('/api/rewrite', { method: 'POST', headers: auth('wrong'), body: '{}' })
  assert.equal(bad.status, 401)
})

test('rewrite streams progress, paragraphs and result, then saves history', async () => {
  const { app, supabase, groq } = setup()
  const res = await app.request('/api/rewrite', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ text: 'One.\n\nTwo two.', mode: 'academic', options: { length: 'shorter' } }),
  })
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('Content-Type'), 'application/x-ndjson')
  const events = await readNdjson(res)
  assert.deepEqual(events.map(e => e.type), ['progress', 'paragraph', 'progress', 'paragraph', 'result'])
  assert.equal(events.at(-1).rewritten_text, 'REWRITTEN(One.)\n\nREWRITTEN(Two two.)')
  assert.match(groq.calls[0].messages[0].content, /formal, polished register/)
  assert.match(groq.calls[0].messages[0].content, /noticeably shorter/)

  const [row] = supabase.tables.rewrites
  assert.equal(row.user_id, 'alice')
  assert.equal(row.mode, 'academic')
  assert.equal(row.original_word_count, 3)
  assert.equal('workflow_name' in row, false)
})

test('rewrite with a starter workflow uses its steps and stores the name', async () => {
  const { app, supabase, groq } = setup()
  const res = await app.request('/api/rewrite', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ text: 'Hello', workflowId: 'starter:email_polish' }),
  })
  await readNdjson(res)
  assert.match(groq.calls[0].messages[0].content, /Apply the following edits to the text, in order:\n1\. Correct spelling/)
  assert.equal(supabase.tables.rewrites[0].mode, 'workflow')
  assert.equal(supabase.tables.rewrites[0].workflow_name, 'Email Polish')
})

test('rewrite with inline steps', async () => {
  const { app, groq } = setup()
  await readNdjson(await app.request('/api/rewrite', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ text: 'Hi', steps: [{ id: 'translate', params: { lang: 'German' } }] }),
  }))
  assert.match(groq.calls[0].messages[0].content, /into German/)
})

test('rewrite rejects invalid body with 400', async () => {
  const { app } = setup()
  const res = await app.request('/api/rewrite', { method: 'POST', headers: auth(), body: JSON.stringify({ text: '' }) })
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error, 'text is required')
})

test('rewrite reports Groq failure as a stream error', async () => {
  const supabase = createFakeSupabase()
  const app = createApp({
    supabase,
    groq: {},
    config: { paragraphDelayMs: 0 },
    rewriteParagraph: async () => { throw new Error('boom') },
  })
  const events = await readNdjson(await app.request('/api/rewrite', { method: 'POST', headers: auth(), body: JSON.stringify({ text: 'x' }) }))
  assert.equal(events.at(-1).type, 'error')
  assert.match(events.at(-1).message, /paragraph 1: boom/)
  assert.equal(supabase.tables.rewrites.length, 0)
})

test('rate limit and daily quota return 429', async () => {
  const { app } = setup({ rateLimitPerMinute: 1 })
  const send = () => app.request('/api/rewrite', { method: 'POST', headers: auth(), body: JSON.stringify({ text: 'x' }) })
  await (await send()).text()
  assert.equal((await send()).status, 429)

  const q = setup({ dailyCharLimit: 3 }).app
  const res = await q.request('/api/rewrite', { method: 'POST', headers: auth(), body: JSON.stringify({ text: 'four' }) })
  assert.equal(res.status, 429)
  assert.match((await res.json()).error, /Daily character limit/)
})

test('workflow CRUD is scoped to the signed-in user', async () => {
  const { app } = setup()
  const created = await app.request('/api/workflows', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ name: 'Mine', steps: ['grammar', 'concise'] }),
  })
  assert.equal(created.status, 201)
  const { workflow } = await created.json()
  assert.equal(workflow.user_id, 'alice')

  const aliceList = await (await app.request('/api/workflows', { headers: auth() })).json()
  assert.equal(aliceList.workflows.length, 1)
  const bobList = await (await app.request('/api/workflows', { headers: auth('token-bob') })).json()
  assert.equal(bobList.workflows.length, 0)

  // Bob can't use, edit or delete Alice's workflow
  const bobRun = await app.request('/api/rewrite', { method: 'POST', headers: auth('token-bob'), body: JSON.stringify({ text: 'x', workflowId: workflow.id }) })
  assert.equal(bobRun.status, 404)
  const bobEdit = await app.request(`/api/workflows/${workflow.id}`, { method: 'PUT', headers: auth('token-bob'), body: JSON.stringify({ name: 'Hijack', steps: ['grammar'] }) })
  assert.equal(bobEdit.status, 404)
  assert.equal((await app.request(`/api/workflows/${workflow.id}`, { method: 'DELETE', headers: auth('token-bob') })).status, 404)

  const updated = await app.request(`/api/workflows/${workflow.id}`, { method: 'PUT', headers: auth(), body: JSON.stringify({ name: 'Renamed', steps: ['formal'] }) })
  assert.equal((await updated.json()).workflow.name, 'Renamed')

  const run = await app.request('/api/rewrite', { method: 'POST', headers: auth(), body: JSON.stringify({ text: 'x', workflowId: workflow.id }) })
  assert.equal(run.status, 200)
  await run.text()

  assert.equal((await app.request(`/api/workflows/${workflow.id}`, { method: 'DELETE', headers: auth() })).status, 200)
  assert.equal((await (await app.request('/api/workflows', { headers: auth() })).json()).workflows.length, 0)
})

test('workflow create validates input', async () => {
  const { app } = setup()
  const res = await app.request('/api/workflows', { method: 'POST', headers: auth(), body: JSON.stringify({ name: '', steps: [] }) })
  assert.equal(res.status, 400)
})

test('history list and delete', async () => {
  const { app, supabase } = setup()
  await (await app.request('/api/rewrite', { method: 'POST', headers: auth(), body: JSON.stringify({ text: 'x' }) })).text()
  const { rewrites } = await (await app.request('/api/history', { headers: auth() })).json()
  assert.equal(rewrites.length, 1)

  assert.equal((await app.request(`/api/history/${rewrites[0].id}`, { method: 'DELETE', headers: auth('token-bob') })).status, 404)
  assert.equal((await app.request('/api/history/not-a-uuid', { method: 'DELETE', headers: auth() })).status, 404)
  assert.equal((await app.request(`/api/history/${rewrites[0].id}`, { method: 'DELETE', headers: auth() })).status, 200)
  assert.equal(supabase.tables.rewrites.length, 0)
})

test('health reports degraded without Supabase', async () => {
  const app = createApp({ groq: createFakeGroq(), supabase: null })
  const res = await app.request('/api/health')
  assert.equal(res.status, 503)
  assert.deepEqual((await res.json()).checks, { groq: true, supabase: false })
})
