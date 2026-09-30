# CI/CD

GitHub Actions (`.github/workflows/`), on every push and pull request:

| Workflow | Steps |
|----------|-------|
| `backend-ci.yml` | Node 20 → `npm ci` → `npm test` |
| `frontend-ci.yml` | Node 20 → `npm ci` → `npm run lint` → `npm test` → `npm run build` |
| `python-ci.yml` | Python 3.11 → `pip install -r requirements.txt` → `python -m unittest discover tests` |

Deploys aren't run from CI: Render auto-deploys the backend from `render.yaml`, and Vercel builds the frontend from `frontend/`.
