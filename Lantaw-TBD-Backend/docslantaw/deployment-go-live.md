# Deployment (Go live) — Vercel and Render

This chapter is **2.5 Deployment (Go live)**. It complements **2.3 Deployment**, which describes environments, hosting options, configuration, and security at a high level. Here, the steps assume:

- **Backend**: Django project under `lantaw/` in the **Lantaw-TBD-Backend** repository (see `manage.py` and `lantaw/wsgi.py`).
- **Frontend**: Vite + React under `lantaw-frontend/` in the **Lantaw-TBD-Frontend** repository.
- **Production database**: PostgreSQL (not SQLite).
- **Python**: **3.11.x** on the server (see [Lantaw-TBD-Backend README](../README.md) — Dagster and related pins exclude 3.13+).

---

## 2.5 Deployment (Go live)

### Overview of the target setup

| Layer | Platform | Role |
|--------|-----------|------|
| API + admin + static (Django) | [Render](https://render.com/) | Web service running Gunicorn |
| Database | Render PostgreSQL | Primary datastore |
| SPA (built static files) | [Vercel](https://vercel.com/) | Hosts the Vite production build |

Traffic flow: browsers load the app from Vercel; the app calls the Render API origin using `VITE_API_URL`. All production traffic should use HTTPS (per 2.3).

### Prerequisites

1. GitHub (or GitLab) accounts connected to Render and Vercel.
2. Backend and frontend repositories pushed to the remote host.
3. Strong values ready for **SECRET_KEY** and production **ALLOWED_HOSTS** / CORS (see 2.3). JWT signing uses Django’s secret unless you configure Simple JWT separately.

### A. PostgreSQL on Render

1. In the Render dashboard, choose **New** → **PostgreSQL**.
2. Select a plan, region, and database name; create the instance.
3. After provisioning, open the database **Info** (or **Connect**) and copy the **Internal Database URL** (preferred if the API runs on Render in the same region) or **External Database URL** if required.
4. Keep this URL secret; you will set it as **`DATABASE_URL`** on the web service.

### B. Django API on Render

These steps follow the backend layout: set the service **root directory** to the folder that contains `manage.py` (`lantaw` when the service uses the backend repo root).

1. **New** → **Web Service**, connect the **Lantaw-TBD-Backend** repository.
2. Configure:
   - **Root Directory**: `lantaw`
   - **Runtime**: Python **3.11** (e.g. add a `runtime.txt` in `lantaw` with `python-3.11.9`, or set the version in the service settings if Render exposes it).
   - **Build Command** (example):

     ```bash
     pip install -r requirements.lock.txt && python manage.py collectstatic --noinput
     ```

     For development-style installs you may use `requirements.txt` instead; production should prefer **`requirements.lock.txt`** when you want pinned versions (see backend README).

   - **Start Command**:

     ```bash
     gunicorn lantaw.wsgi:application
     ```

3. **Environment variables** (minimum; align names with your `settings.py`):

   | Variable | Purpose |
   |----------|---------|
   | `SECRET_KEY` | Django secret; must be unique and strong in production. |
   | `DEBUG` | Set to `0` or `False` so `DEBUG` is off (match how your settings parse booleans). |
   | `ALLOWED_HOSTS` | Comma-separated hosts, e.g. `your-api.onrender.com`. |
   | `DATABASE_URL` | PostgreSQL URL from step A (Render provides this when you link the database). |

4. **Production database in Django**  
   The project lists **`dj-database-url`** in `lantaw/requirements.txt`. Before go-live, ensure production settings use PostgreSQL when `DATABASE_URL` is present, for example:

   ```python
   import dj_database_url

   DATABASES = {
       "default": dj_database_url.config(
           default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
           conn_max_age=600,
       )
   }
   ```

   Replace any hard-coded SQLite-only `DATABASES` block when deploying. Run migrations against Postgres:

   ```bash
   python manage.py migrate
   ```

   Run this locally against the production `DATABASE_URL` (with care), or use a one-off **Shell** on Render, or a release-phase script if you add one later.

5. **CORS**  
   Restrict origins to your Vercel URL(s) (per 2.3). Your `settings.py` should use explicit allowed origins in production instead of allowing all hosts.

6. Deploy the service. Note the public HTTPS URL (e.g. `https://<service-name>.onrender.com`). This value is the API **origin** for the frontend.

**Cold starts:** Render free/low tiers may spin down; first request after idle can be slow. Plan tier and health checks accordingly.

### C. Frontend on Vercel

1. In Vercel, **Add New** → **Project** and import the **Lantaw-TBD-Frontend** repository.
2. Configure the project:
   - **Framework Preset**: Vite (or Other with the commands below).
   - **Root Directory**: `lantaw-frontend` (if that is the app folder in the repo).
   - **Build Command**: `npm run build` (or `pnpm build` / `yarn build` if you use those).
   - **Output Directory**: `dist` (Vite default).

3. **Environment variables** (Production — set in Vercel → Project → Settings → Environment Variables):

   | Variable | Example / notes |
   |----------|------------------|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com` — no trailing slash required if your client uses paths like `/api/...`. Must match the live API origin. |
   | `VITE_BASE_PATH` | If the app is served from the site root on Vercel, set `/` (the Vite config defaults to `/Lantaw/` for subdirectory deployments). |

   The client uses `import.meta.env.VITE_API_URL` as Axios `baseURL` so requests target the Render API directly in production.

4. Deploy. After the first deployment, open the Vercel URL and verify login and API calls (check browser network tab for correct host and CORS).

5. **Finish backend CORS / hosts**  
   Add your Vercel production domain (and preview domains if needed) to Django **CORS allowed origins** and, if applicable, **CSRF trusted origins** for your deployment pattern.

### D. Go-live checklist (order matters)

1. PostgreSQL created; `DATABASE_URL` set on Render.
2. Django settings: `DEBUG` off, `ALLOWED_HOSTS` correct, database uses Postgres, CORS locked to frontend origin(s).
3. Migrations applied on production database.
4. `collectstatic` runs in the Render build (WhiteNoise is already in middleware in `settings.py`).
5. Render web service healthy; API reachable over HTTPS.
6. Vercel `VITE_API_URL` and `VITE_BASE_PATH` set; redeploy frontend after changing env vars.
7. Smoke test: login, token refresh, and a few critical API flows.

### Related documentation

- [Lantaw-TBD-Backend README](../README.md) — Python version and dependency install notes for servers.
- **2.3 Deployment** (project narrative) — environment choices, secrets, HTTPS, and audit logging expectations.

---

**Last updated**: 2025-03-23  
**Maintained by**: Development team
