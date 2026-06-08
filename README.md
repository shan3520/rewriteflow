# RewriteFlow — AI-Powered Text Refinement

Rewrite text paragraph-by-paragraph using **Llama 3.3 70B** via Groq, with real-time streaming, Supabase auth, and persistent history. Built for writers, professionals, and creators who demand precision and originality.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite 5 · Tailwind CSS 3 |
| Backend | Node.js · Hono |
| AI | Groq SDK (llama-3.3-70b-versatile) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel (frontend) · Render (backend) |

## Features

- ✍️ **5 refinement modes** — Standard, Professional, Extensive, Clarified, Expressive
- ⚡ **Real-time streaming** — paragraphs appear as they're rewritten (ndjson)
- 🔒 **Secure** — JWT auth, RLS policies, CORS lockdown, input validation
- 📜 **History** — searchable, filterable, with re-use and delete
- 🌙 **Dark mode** — system-aware with manual toggle
- 📱 **Responsive** — mobile-first with glassmorphism UI

## Quick Start

```bash
# 1. Clone
git clone <your-repo-url>
cd bud-project1

# 2. Backend
cd backend
cp .env.example .env    # fill in credentials
npm install
npm run dev             # http://localhost:3000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env    # fill in credentials
npm install
npm run dev             # http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key ([console.groq.com](https://console.groq.com)) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret |
| `PORT` | Server port (default: 3000) |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_BASE_URL` | Backend URL (default: http://localhost:3000) |

## Database Setup

Run `db/schema.sql` in your Supabase SQL Editor to create tables, triggers, and RLS policies.

## Deployment

- **Frontend → Vercel**: Set root directory to `frontend`, add env vars in dashboard
- **Backend → Render**: Auto-detected via `render.yaml`, add env vars in dashboard
- Set `ALLOWED_ORIGINS` on Render to your Vercel URL
- Set `VITE_API_BASE_URL` on Vercel to your Render URL

## License

MIT
