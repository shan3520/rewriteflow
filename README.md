# RewriteFlow — AI-Powered Text Refinement

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Hono-339933?logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?logo=groq&logoColor=white)

Rewrite text paragraph-by-paragraph using **Llama 3.3 70B** via Groq, with real-time streaming, Supabase auth, and persistent history. Built for writers, professionals, and creators who demand precision and originality.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite 5 · Tailwind CSS 3 · Framer Motion |
| Backend | Node.js · Hono |
| AI | Groq SDK (`llama-3.3-70b-versatile`) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel (frontend) · Render (backend) |

## Features

- ✍️ **5 refinement modes** — Standard, Professional, Extensive, Clarified, Expressive
- ⚡ **Real-time streaming** — paragraphs appear as they're rewritten (ndjson)
- 🔒 **Secure** — JWT auth, RLS policies, CORS lockdown, input validation
- 📜 **History** — searchable, filterable, with re-use and delete
- 🌙 **Dark mode** — system-aware with manual toggle
- 📱 **Responsive** — mobile-first with glassmorphism UI

## Project Structure

```
rewriteflow/
├── README.md            ← you are here
├── render.yaml          Render deploy config (backend)
├── docs/                ← all documentation lives here
│   ├── BACKEND.md       Backend API reference + streaming protocol
│   ├── FRONTEND.md      Frontend structure, routing, scripts
│   ├── ARCHITECTURE.md  How the pieces fit: request & data flow
│   ├── PRODUCT.md       Product requirements (audience, value, principles)
│   └── DESIGN.md        Visual + interaction design system
├── db/
│   └── schema.sql       Supabase schema: tables, triggers, RLS policies
├── backend/             Hono API (code only)
│   └── src/index.js
└── frontend/            React + Vite app (code only)
    └── src/
```

## Refinement Modes

The UI shows friendly **labels**, but the API and database use internal **values**. When calling the API directly, send the value (left column).

| API value | UI label | Description |
|-----------|----------|-------------|
| `standard` | Standard | Preserves the original meaning with fresh wording |
| `academic` | Professional | Formal scholarly tone and polished structure |
| `aggressive` | Extensive | Maximum restructuring for originality |
| `simplified` | Clarified | Plain English for maximum readability |
| `creative` | Expressive | A more literary, engaging rewrite |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/shan3520/rewriteflow.git
cd rewriteflow

# 2. Database — run db/schema.sql in your Supabase SQL Editor

# 3. Backend
cd backend
# create a .env file with the variables below
npm install
npm run dev             # http://localhost:3000

# 4. Frontend (new terminal)
cd frontend
# create a .env file with the variables below
npm install
npm run dev             # http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key ([console.groq.com](https://console.groq.com)) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret (bypasses RLS) |
| `PORT` | Server port (default: 3000) |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_BASE_URL` | Backend URL (default: http://localhost:3000) |

## Database Setup

Run `db/schema.sql` in your Supabase SQL Editor to create the `users` and `rewrites` tables, the new-user trigger, and the RLS policies. See [`db/schema.sql`](db/schema.sql) for details.

## Documentation

- **[docs/BACKEND.md](docs/BACKEND.md)** — API reference, the ndjson streaming protocol, retry/rate-limit behavior
- **[docs/FRONTEND.md](docs/FRONTEND.md)** — app structure, routing, scripts, state
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — end-to-end request & data flow, auth model
- **[docs/PRODUCT.md](docs/PRODUCT.md)** — product requirements & principles
- **[docs/DESIGN.md](docs/DESIGN.md)** — design system

## Deployment

- **Frontend → Vercel**: Set root directory to `frontend`, add env vars in dashboard
- **Backend → Render**: Auto-detected via `render.yaml`, add env vars in dashboard
- Set `ALLOWED_ORIGINS` on Render to your Vercel URL
- Set `VITE_API_BASE_URL` on Vercel to your Render URL

## License

Released under the [MIT License](LICENSE).
