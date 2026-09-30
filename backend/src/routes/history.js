import { Hono } from 'hono'
import { isUuid } from '../middleware/validate.js'

export function historyRoutes({ repo, auth }) {
  const r = new Hono()
  r.use('*', auth)

  r.get('/', async (c) => {
    const rewrites = await repo.listHistory(c.get('user').id)
    return c.json({ rewrites })
  })

  r.delete('/:id', async (c) => {
    const id = c.req.param('id')
    if (!isUuid(id)) return c.json({ error: 'Not found or unauthorized' }, 404)
    await repo.deleteHistory(c.get('user').id, id)
    return c.json({ success: true })
  })

  return r
}
