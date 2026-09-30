import { randomUUID } from 'node:crypto'

// Minimal in-memory stand-in for the parts of supabase-js the repository uses:
// from(table).select/insert/update/delete + eq/order/limit/single/maybeSingle,
// and auth.getUser(token).
export function createFakeSupabase({ users = { 'token-alice': { id: 'alice' }, 'token-bob': { id: 'bob' } } } = {}) {
  const tables = { users: [{ id: 'alice' }, { id: 'bob' }], rewrites: [], workflows: [] }

  function query(table) {
    const state = { op: 'select', filters: [], order: null, limit: null, payload: null, returning: false, single: null }
    const builder = {
      select() { if (state.op === 'select') state.op = 'select'; else state.returning = true; return builder },
      insert(rows) { state.op = 'insert'; state.payload = Array.isArray(rows) ? rows : [rows]; return builder },
      update(patch) { state.op = 'update'; state.payload = patch; return builder },
      delete() { state.op = 'delete'; return builder },
      eq(col, val) { state.filters.push(r => r[col] === val); return builder },
      order(col, { ascending = true } = {}) { state.order = { col, ascending }; return builder },
      limit(n) { state.limit = n; return builder },
      single() { state.single = 'single'; return builder },
      maybeSingle() { state.single = 'maybe'; return builder },
      then(resolve, reject) { return Promise.resolve().then(run).then(resolve, reject) },
    }

    function run() {
      const rows = tables[table]
      if (!rows) return { data: null, error: { message: `relation "${table}" does not exist` } }
      const match = r => state.filters.every(f => f(r))
      let data

      if (state.op === 'insert') {
        const now = new Date().toISOString()
        data = state.payload.map(r => ({ id: randomUUID(), created_at: now, updated_at: now, ...r }))
        rows.push(...data)
        if (!state.returning) data = null
      } else if (state.op === 'update') {
        data = rows.filter(match)
        data.forEach(r => Object.assign(r, state.payload))
      } else if (state.op === 'delete') {
        data = rows.filter(match)
        tables[table] = rows.filter(r => !match(r))
      } else {
        data = rows.filter(match)
        if (state.order) {
          const { col, ascending } = state.order
          data = [...data].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (ascending ? 1 : -1))
        }
        if (state.limit != null) data = data.slice(0, state.limit)
      }

      if (state.single) {
        if (!data?.length) {
          return state.single === 'maybe' ? { data: null, error: null } : { data: null, error: { message: 'no rows' } }
        }
        data = data[0]
      }
      return { data: data ? structuredClone(data) : data, error: null }
    }

    return builder
  }

  return {
    tables,
    from: query,
    auth: {
      async getUser(token) {
        const user = users[token]
        return user ? { data: { user }, error: null } : { data: { user: null }, error: { message: 'invalid' } }
      },
    },
  }
}

export function createFakeGroq() {
  const calls = []
  return {
    calls,
    models: { list: async () => ({ data: [] }) },
    chat: {
      completions: {
        create: async (req) => {
          calls.push(req)
          return { choices: [{ message: { content: `REWRITTEN(${req.messages[1].content})` } }] }
        },
      },
    },
  }
}
