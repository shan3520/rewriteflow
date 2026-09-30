// Verifies the Supabase access token in the Authorization header and exposes
// the user as c.get('user').
export function requireAuth(supabase) {
  return async (c, next) => {
    if (!supabase) return c.json({ error: 'Supabase not configured' }, 401)
    const header = c.req.header('Authorization')
    if (!header || !header.startsWith('Bearer ')) {
      return c.json({ error: 'Missing authorization token' }, 401)
    }
    const token = header.slice('Bearer '.length).trim()
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return c.json({ error: 'Invalid or expired token' }, 401)
    c.set('user', data.user)
    await next()
  }
}
