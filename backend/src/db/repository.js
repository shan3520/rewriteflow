import { HttpError } from '../middleware/errorHandler.js'

function check({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

// All Supabase queries in one place. Every query is scoped to the user id,
// because the service-role key bypasses row-level security.
export function createRepository(supabase) {
  return {
    async ping() {
      const { error } = await supabase.from('users').select('id').limit(1)
      return !error
    },

    async listHistory(userId) {
      return check(await supabase
        .from('rewrites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }))
    },

    async deleteHistory(userId, id) {
      const rows = check(await supabase.from('rewrites').delete().eq('id', id).eq('user_id', userId).select('id'))
      if (!rows?.length) throw new HttpError(404, 'Not found or unauthorized')
    },

    async insertRewrite(row) {
      check(await supabase.from('rewrites').insert(row))
    },

    async listWorkflows(userId) {
      return check(await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }))
    },

    async getWorkflow(userId, id) {
      const row = check(await supabase.from('workflows').select('*').eq('id', id).eq('user_id', userId).maybeSingle())
      if (!row) throw new HttpError(404, 'Workflow not found')
      return row
    },

    async createWorkflow(userId, workflow) {
      return check(await supabase.from('workflows').insert({ ...workflow, user_id: userId }).select().single())
    },

    async updateWorkflow(userId, id, workflow) {
      const row = check(await supabase
        .from('workflows')
        .update({ ...workflow, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle())
      if (!row) throw new HttpError(404, 'Workflow not found')
      return row
    },

    async deleteWorkflow(userId, id) {
      const rows = check(await supabase.from('workflows').delete().eq('id', id).eq('user_id', userId).select('id'))
      if (!rows?.length) throw new HttpError(404, 'Workflow not found')
    },
  }
}
