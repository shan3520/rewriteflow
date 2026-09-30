# Backend security

- **Secrets stay on the server.** The Groq key and Supabase service-role key exist only in the backend's environment. The browser holds the Supabase anon key only.
- **Identity comes from the token.** `middleware/auth.js` verifies the bearer token with Supabase on every protected route. User ids are never taken from the request body.
- **Every query is scoped.** The service-role key bypasses RLS, so each query in `db/repository.js` filters by the verified user id, and updates and deletes match on both `id` and `user_id`. Tests confirm one user can't read, run, edit or delete another's workflows or history.
- **RLS as a second layer.** Policies on `users`, `rewrites` and `workflows` restrict anon-key access to the owner's rows.
- **Input validation** (`middleware/validate.js`): text ≤ 50,000 chars; mode, step ids, step params and options checked against `shared/steps.json`; workflows ≤ 10 steps; custom instructions ≤ 1,000 chars; workflow ids must be a uuid or `starter:<slug>`.
- **Abuse limits.** A per-user sliding-window rate limit on `/api/rewrite` (`RATE_LIMIT_PER_MINUTE`, default 20) and an optional daily character quota (`DAILY_CHAR_LIMIT`). Both are in memory, which suits a single instance. Use a shared store if you run several.
- **CORS** is limited to `ALLOWED_ORIGINS`.
- **Errors** return a generic message for anything unexpected. Details are logged server-side only.
- **Custom instructions** are the user's own prompt to their own rewrites. They go to the model as system-prompt text and never reach other users.
