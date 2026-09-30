import { Hono } from 'hono'
import { isUuid, validateWorkflowBody } from '../middleware/validate.js'

/**
 * GET  /api/steps               step library + option choices (public)
 * GET  /api/workflows/starters  built-in starter workflows (public)
 * GET  /api/workflows           the user's saved workflows
 * POST /api/workflows           create
 * PUT  /api/workflows/:id       update
 * DELETE /api/workflows/:id     delete
 */
export function pipelineRoutes({ library, repo, auth }) {
  const r = new Hono()

  r.get('/steps', (c) => c.json({
    steps: library.steps,
    modes: Object.fromEntries(Object.entries(library.modes).map(([k, v]) => [k, v.label])),
    options: Object.fromEntries(Object.entries(library.options).map(([k, v]) => [k, Object.keys(v)])),
  }))

  r.get('/workflows/starters', (c) => c.json({ workflows: library.starters }))

  r.get('/workflows', auth, async (c) => {
    return c.json({ workflows: await repo.listWorkflows(c.get('user').id) })
  })

  r.post('/workflows', auth, async (c) => {
    const body = await c.req.json().catch(() => null)
    const { value, error } = validateWorkflowBody(library, body)
    if (error) return c.json({ error }, 400)
    const workflow = await repo.createWorkflow(c.get('user').id, value)
    return c.json({ workflow }, 201)
  })

  r.put('/workflows/:id', auth, async (c) => {
    const id = c.req.param('id')
    if (!isUuid(id)) return c.json({ error: 'Workflow not found' }, 404)
    const body = await c.req.json().catch(() => null)
    const { value, error } = validateWorkflowBody(library, body)
    if (error) return c.json({ error }, 400)
    const workflow = await repo.updateWorkflow(c.get('user').id, id, value)
    return c.json({ workflow })
  })

  r.delete('/workflows/:id', auth, async (c) => {
    const id = c.req.param('id')
    if (!isUuid(id)) return c.json({ error: 'Workflow not found' }, 404)
    await repo.deleteWorkflow(c.get('user').id, id)
    return c.json({ success: true })
  })

  return r
}
