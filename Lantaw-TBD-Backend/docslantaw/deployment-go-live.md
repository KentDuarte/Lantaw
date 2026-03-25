# Deployment (Go live) — Vercel and Render

This chapter is **2.5 Deployment (Go live)**. It complements **2.3 Deployment**, which describes environments, hosting options, configuration, and security at a high level.

**Layouts covered here:**

- **Monorepo** (single Git repo containing both apps): Render **Root Directory** `Lantaw-TBD-Backend/lantaw`; Vercel **Root Directory** `Lantaw-TBD-Frontend/lantaw-frontend` (with “include files outside the root directory” enabled if your monorepo needs it).
- **Split repos**: Render root `lantaw` (backend repo only); Vercel root `lantaw-frontend` (frontend repo only).

In all cases, the runnable Django app lives where `manage.py` is (`lantaw/wsgi.py` for Gunicorn).

- **Production database**: PostgreSQL (not SQLite).
- **Python on Render**: The team deployment uses **`PYTHON_VERSION=3.12.2`** in the service environment. The [backend README](../README.md) standardizes on **3.11.x** for Dagster-related pins; if installs fail on 3.12, align the service with **3.11** instead.

---

## 2.5 Deployment (Go live)

### Overview of the target setup

| Layer | Platform | Role |
|--------|-----------|------|
| API + admin + static (Django) | [Render](https://render.com/) | Web service running Gunicorn |
| Database | Render PostgreSQL | Primary datastore |
| SPA (built static files) | [Vercel](https://vercel.com/) | Hosts the Vite production build |

Traffic flow: browsers load the app from Vercel; the app calls the Render API origin using `VITE_API_URL`. All production traffic should use HTTPS (per 2.3).

### Screenshots for Word / PDF

When you export this chapter, insert each image next to the matching **Figure** callout below. File names are the originals from the deployment screenshots (keep a copy in `docslantaw/figures/` or your media folder if you rename them).

| Figure | File name | What it shows |
|--------|-----------|----------------|
| **Figure 1** | `render-e9cf63b5-1551-44f5-84c4-fa127a868dba.png` | Render — **New Web Service** (repo, branch, region, language; service name e.g. Lantaw-1). |
| **Figure 2** | `render2-f43e9caf-bc8d-49cf-b2f5-a8ffef93308f.png` | Render — **Build & Deploy**: repository URL, branch `main`, **Root Directory** `Lantaw-TBD-Backend/lantaw`. |
| **Figure 3** | `render3-aee8914f-f5e6-4a9f-b726-35536c8844ea.png` | Render — **Build Command**, **Pre-Deploy Command**, **Start Command**, **Auto-Deploy**, **Deploy Hook**. |
| **Figure 4** | `render4-f0bd496d-a333-43d8-b61e-0625b7b93b5d.png` | Render — **Environment** tab: **Environment Variables** (`ALLOWED_HOSTS`, `PYTHON_VERSION`, etc.). |
| **Figure 5** | `render1-42b801ba-6d6a-4d35-996a-b7b4be5dba7d.png` | Render — **Settings → General**: service name, region (Oregon), plan (Free), public `.onrender.com` URL. |
| **Figure 6** | `vercel2-adac9308-8a4e-409e-9070-826afae2ef2c.png` | Vercel — **Build and Deployment**: **Root Directory** `Lantaw-TBD-Frontend/lantaw-frontend`, monorepo toggles. |
| **Figure 7** | `vercel-cd9a2ea9-ecce-40cf-a080-a9fc802ab101.png` | Vercel — **Framework Preset** Vite; **Install** / **Build** / **Output** overrides (`npm install`, `npm run build`, `dist`). |
| **Figure 8** | `vercel1-7a0663d9-405a-446e-acc2-118c3791de69.png` | Vercel — **Environment Variables** (`VITE_API_URL`, `VITE_BASE_PATH`). |

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

1. **New** → **Web Service**, connect your Git repository (monorepo or backend-only).

   **Figure 1** — *`render-e9cf63b5-1551-44f5-84c4-fa127a868dba.png`* — New Web Service: linked GitHub repo, branch, Python 3, region.

2. Under **Settings → Build & Deploy** (working directory is the **Root Directory** below):

   **Figure 2** — *`render2-f43e9caf-bc8d-49cf-b2f5-a8ffef93308f.png`* — Repository, branch, and **Root Directory** `Lantaw-TBD-Backend/lantaw`.
   - **Root Directory** (monorepo): `Lantaw-TBD-Backend/lantaw`  
     (backend-only repo: `lantaw` or leave blank if `manage.py` is at the repo root—match where `manage.py` lives.)
   - **Branch**: e.g. `main`.
   - **Region / instance**: e.g. Oregon (US West), Free tier as needed.

3. **Build Command** (as configured for this project):

   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py seed_data && python manage.py collectstatic --noinput
   ```

4. **Start Command** (as configured for this project):

   ```bash
   python manage.py migrate --noinput && gunicorn lantaw.wsgi:application
   ```

   **Figure 3** — *`render3-aee8914f-f5e6-4a9f-b726-35536c8844ea.png`* — **Build Command**, **Start Command**, **Pre-Deploy**, **Auto-Deploy**, and **Deploy Hook** as in the dashboard.

   **Notes on these commands**

   - **Migrations** run in both the build and the start command; that is redundant but harmless. You may keep only **start** (or only **pre-deploy**) for migrations if you prefer a single place.
   - **`seed_data`** runs on **every** successful build. The bundled command generates **new random demo data** via `django-seed` each time (`core.management.commands.seed_data`). That is useful for a fresh demo database but will **accumulate extra rows on every deploy** in production. For a stable production DB, remove `python manage.py seed_data &&` from the build after the first seed, or run seeding once from the Render **Shell** instead.
   - For **pinned** dependencies in production, consider switching `pip install -r requirements.txt` to `pip install -r requirements.lock.txt` (see backend README).

5. **Pre-Deploy Command** (optional on Render): left empty in the current setup; migrations are handled in build/start instead.

6. **Auto-Deploy**: can be turned **Off** if you want manual or hook-only deploys (as in the current service). When Off, trigger deploys from the dashboard or a **Deploy Hook** URL.

7. **Environment variables** (**Environment** tab in the Render dashboard; use **Edit** to change):

   **Figure 4** — *`render4-f0bd496d-a333-43d8-b61e-0625b7b93b5d.png`* — **Environment Variables** list (e.g. `ALLOWED_HOSTS`, `PYTHON_VERSION`).

   | Variable | Purpose |
   |----------|---------|
   | `PYTHON_VERSION` | e.g. `3.12.2` — pins the runtime Render uses for builds and the running service. |
   | `SECRET_KEY` | Django secret; must be unique and strong in production. |
   | `DEBUG` | Set to `0` or `False` so `DEBUG` is off (match how your settings parse booleans). |
   | `ALLOWED_HOSTS` | Comma-separated, **no spaces** unless your `settings.py` strips them. Example: `lantaw-5fyc.onrender.com,localhost,127.0.0.1` (production hostname plus local dev if needed). |
   | `DATABASE_URL` | PostgreSQL URL from step A (Render injects this when the database is linked to the web service). |

8. **Production database in Django**  
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

9. **CORS**  
   Restrict origins to your Vercel URL(s) (per 2.3). Your `settings.py` should use explicit allowed origins in production instead of allowing all hosts.

10. Deploy the service. Note the public HTTPS URL (e.g. `https://lantaw-5fyc.onrender.com`). Set **`VITE_API_URL`** on Vercel to this origin (no path suffix; the app calls `/api/...` on that host).

**Figure 5** — *`render1-42b801ba-6d6a-4d35-996a-b7b4be5dba7d.png`* — **Settings → General**: service name, region, instance/plan, and public service URL on Render.

**Cold starts:** Render free/low tiers may spin down; first request after idle can be slow. Plan tier and health checks accordingly.

### C. Frontend on Vercel

1. In Vercel, **Add New** → **Project** and import the repository (monorepo or frontend-only).

2. **Settings → Build and Deployment**
   - **Framework Preset**: **Vite**.

   **Figure 6** — *`vercel2-adac9308-8a4e-409e-9070-826afae2ef2c.png`* — **Root Directory** `Lantaw-TBD-Frontend/lantaw-frontend` and options to include files outside the root / skip path-only deploys.

   - **Root Directory** (monorepo): `Lantaw-TBD-Frontend/lantaw-frontend`  
     (frontend-only repo: `lantaw-frontend` or `.` depending on layout.)
   - Optional: enable **Include files outside the root directory in the Build Step** if the monorepo needs it; **Skip deployments when there are no changes to the root directory** can stay off unless you want path-scoped deploys.
   - **Overrides** (as deployed):  
     - **Install Command**: `npm install`  
     - **Build Command**: `npm run build`  
     - **Output Directory**: `dist`  
     - **Development Command**: `vite` (override usually off)

   **Figure 7** — *`vercel-cd9a2ea9-ecce-40cf-a080-a9fc802ab101.png`* — **Framework Preset** Vite and overridden install/build/output commands.

3. **Environment variables** (**Settings → Environment Variables**; scope **All Environments** or Production as appropriate):

   **Figure 8** — *`vercel1-7a0663d9-405a-446e-acc2-118c3791de69.png`* — Project **Environment Variables** (`VITE_API_URL`, `VITE_BASE_PATH`).

   | Variable | Example / notes |
   |----------|------------------|
   | `VITE_API_URL` | `https://<your-service>.onrender.com` (e.g. `https://lantaw-5fyc.onrender.com`) — must match the live Render API **origin**; client uses paths like `/api/...`. |
   | `VITE_BASE_PATH` | `/` when the app is served at the site root on Vercel (overrides the Vite default `/Lantaw/` used for subdirectory hosting). |

   The client uses `import.meta.env.VITE_API_URL` as Axios `baseURL` so production requests go to Render.

4. Deploy. After the first deployment, open the Vercel URL and verify login and API calls (check the browser network tab for the correct host and CORS).

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

**Last updated**: 2026-03-23  
**Maintained by**: Development team
