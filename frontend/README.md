# RewriteFlow Frontend

The React single-page app for RewriteFlow: auth, the rewrite editor with live streaming, and history. Built with **React 19**, **Vite 5**, **Tailwind CSS 3**, and **Framer Motion**.

## Running locally

```bash
cp .env.example .env   # fill in credentials
npm install
npm run dev            # http://localhost:5173
```

### Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Environment variables (`.env`)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_BASE_URL` | Backend URL (default `http://localhost:3000`) |

## Structure

```
src/
├── main.jsx            App entry; mounts <App> with Auth + Theme providers
├── App.jsx             Router + route guards (lazy-loaded pages)
├── index.css           Tailwind layers + design tokens
├── pages/
│   ├── LoginPage.jsx       /login    (public)
│   ├── RegisterPage.jsx    /register (public)
│   ├── AppPage.jsx         /         (protected) — the rewrite editor
│   └── HistoryPage.jsx     /history  (protected) — past rewrites
├── components/
│   ├── Navbar.jsx
│   └── ui/             Card, Logo, TextField, PasswordField, ThemeToggle
├── context/
│   ├── AuthContext.jsx     Supabase session state
│   └── ThemeContext.jsx    Light/dark theme (system-aware)
└── lib/
    ├── supabase.js     Supabase browser client
    ├── api.js          Backend calls (rewrite stream, history)
    └── cn.js           clsx className helper
```

## Routing & auth

Routes are defined in `App.jsx` and each page is **lazy-loaded** (code-split) so the login screen paints without downloading the editor/history chunks.

| Path | Page | Access |
|------|------|--------|
| `/login` | LoginPage | Public — redirects to `/` if signed in |
| `/register` | RegisterPage | Public — redirects to `/` if signed in |
| `/` | AppPage | Protected — redirects to `/login` if signed out |
| `/history` | HistoryPage | Protected |
| `*` | — | Redirects to `/` |

`AuthContext` holds the Supabase session; `ProtectedRoute`/`PublicRoute` guards in `App.jsx` gate access. The session's `access_token` is sent as a `Bearer` token on every backend call.

## Talking to the backend

`lib/api.js` is the single integration point:

- **`rewriteText(session, text, mode, onProgress, onParagraph, { signal })`** — POSTs to `/api/rewrite` and reads the **ndjson stream**, invoking `onProgress(current, total)` and `onParagraph(text)` as events arrive, and resolving with the final `result`. Pass an `AbortSignal` to cancel mid-rewrite.
- **`getHistory(session)`** — GET `/api/history`.
- **`deleteHistoryItem(session, id)`** — DELETE `/api/history/:id`.

Non-OK responses are converted to friendly, status-aware error messages (`describeError`). See [`../backend/README.md`](../backend/README.md) for the full streaming protocol and event shapes.

## Refinement modes

The mode dropdown shows labels (Standard, Professional, Extensive, Clarified, Expressive) but sends internal **values** to the API (`standard`, `academic`, `aggressive`, `simplified`, `creative`). The mapping lives in the `MODES` array in `pages/AppPage.jsx`.

## Deployment (Vercel)

Configured by [`vercel.json`](vercel.json): Vite framework preset, build to `dist/`, SPA rewrite (all routes → `index.html`), long-lived caching for hashed assets, and security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, etc.). Set the Vercel project **root directory** to `frontend` and add the `VITE_*` env vars (point `VITE_API_BASE_URL` at your Render backend).
