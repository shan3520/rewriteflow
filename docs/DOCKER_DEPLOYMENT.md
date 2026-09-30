# Docker

The root `Dockerfile` builds the backend API only. The frontend deploys to static hosting (Vercel), and the CLI runs locally.

```bash
cp backend/.env.example backend/.env   # fill in Groq + Supabase
docker compose up --build              # http://localhost:3000/api/health
```

The image copies the whole repository because the backend reads `shared/steps.json` and `presets/*.yaml` at startup.
