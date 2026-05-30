# Deploying Captor on Railway (front + back) — demo

Temporary demo hosting. Backend runs on FrankenPHP (production-grade application server) via Railway's Railpack builder.

## Architecture

```
Browser ──HTTPS──> captor-front (Next.js on Railway) ──HTTPS──> captor-back (Laravel on Railway) ──> Postgres
                          │                                  ▲
                          └── server-side calls use the ─────┘
                              private domain (faster, no egress)
```

Two services in one Railway project + a Postgres plugin. Each service gets:

- a **public** domain (e.g. `captor-back-production.up.railway.app`) — browser-reachable
- a **private** domain (e.g. `captor-back.railway.internal`) — only reachable from sibling services in the same project, no egress cost

### Who calls whom

| Caller                                                             | Target                      | Which URL                           | Env var                                                        |
| ------------------------------------------------------------------ | --------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| Browser (React)                                                    | Backend API                 | **Public** backend URL              | `NEXT_PUBLIC_API_URL` (baked into client bundle at build time) |
| Next.js server (Server Components, Server Actions, route handlers) | Backend API                 | **Private** backend URL (preferred) | `API_URL` (server-only)                                        |
| Backend → Frontend (CORS check)                                    | n/a (just origin allowlist) | **Public** frontend URL             | `FRONTEND_URL`                                                 |

The code in `src/lib/api.ts` already picks the server-side override:

```ts
const BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";
```

Setting `API_URL` to the private domain on the frontend service makes SSR/SSA calls go over Railway's internal network. The browser still goes over the public domain via `NEXT_PUBLIC_API_URL`.

### Auth flow

1. User submits login form → Next.js server action calls Laravel `/api/auth/login`.
2. Laravel returns a Sanctum bearer token.
3. Next.js stores it in an httpOnly cookie `captor_session` (see `src/lib/session.ts`).
4. On every subsequent server-side fetch, Next.js reads the cookie and adds `Authorization: Bearer <token>` when calling Laravel.
5. The browser never sees the token and never calls Laravel directly with credentials — so cross-site cookies are not needed; only public form endpoints need CORS, and only with the simple `Authorization` header allowance.

## Step-by-step

### 1. Push both repos to GitHub

```powershell
# in captor-back/
git add . ; git commit -m "Add Railway deploy config" ; git push

# in captor-front/
git add . ; git commit -m "Add deploy config + lint/build fixes" ; git push
```

### 2. Create the Railway project + Postgres

1. https://railway.app → **New Project** → **Empty Project**.
2. **+ New** → **Database** → **Add PostgreSQL**.

### 3. Deploy the backend

1. **+ New** → **GitHub Repo** → `captor-back`.
2. Click the service → **Settings** → rename it to `captor-back` (this makes the internal hostname `captor-back.railway.internal`).
3. **Settings → Networking → Generate Domain** to get the public HTTPS URL.
4. **Variables** — Railway auto-suggests refs as you type `${{ }}`:

| Key                | Value                                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| `APP_NAME`         | `Captor`                                                                       |
| `APP_ENV`          | `production`                                                                   |
| `APP_KEY`          | run `php artisan key:generate --show` locally and paste the `base64:...` value |
| `APP_DEBUG`        | `false`                                                                        |
| `APP_URL`          | `https://${{RAILWAY_PUBLIC_DOMAIN}}`                                           |
| `LOG_CHANNEL`      | `stderr`                                                                       |
| `LOG_LEVEL`        | `info`                                                                         |
| `DB_CONNECTION`    | `pgsql`                                                                        |
| `DB_HOST`          | `${{Postgres.PGHOST}}`                                                         |
| `DB_PORT`          | `${{Postgres.PGPORT}}`                                                         |
| `DB_DATABASE`      | `${{Postgres.PGDATABASE}}`                                                     |
| `DB_USERNAME`      | `${{Postgres.PGUSER}}`                                                         |
| `DB_PASSWORD`      | `${{Postgres.PGPASSWORD}}`                                                     |
| `SESSION_DRIVER`   | `database`                                                                     |
| `CACHE_STORE`      | `database`                                                                     |
| `QUEUE_CONNECTION` | `sync`                                                                         |
| `FILESYSTEM_DISK`  | `local`                                                                        |
| `FRONTEND_URL`     | `https://${{captor-front.RAILWAY_PUBLIC_DOMAIN}}` (set after step 4 exists)    |
| `MAIL_MAILER`      | `log`                                                                          |
| `CLOUDINARY_URL`   | your Cloudinary `cloudinary://...` URL                                         |

5. Railway's **Railpack** builder auto-detects Laravel: installs Composer deps, caches config/routes/views, runs migrations on startup, and serves via **FrankenPHP** (Caddy + embedded PHP) with `/app/public` as the document root. No `Procfile` or `nixpacks.toml` needed.

### 4. Deploy the frontend

1. **+ New** → **GitHub Repo** → `captor-front`.
2. **Settings** → rename to `captor-front`.
3. **Settings → Networking → Generate Domain** to get its public HTTPS URL.
4. **Variables**:

| Key                    | Value                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | `https://${{captor-back.RAILWAY_PUBLIC_DOMAIN}}`                       |
| `API_URL`              | `http://${{captor-back.RAILWAY_PRIVATE_DOMAIN}}:${{captor-back.PORT}}` |
| `NEXT_PUBLIC_SITE_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}`                                   |
| `NODE_ENV`             | `production`                                                           |

5. Go back to **captor-back → Variables** and confirm `FRONTEND_URL` resolves to the front's public URL. Trigger a redeploy if it was added after the first build.

> **Why `NEXT_PUBLIC_API_URL` must point at the public URL:** it gets inlined into the JavaScript bundle the browser downloads. Browsers can't resolve `*.railway.internal`. `API_URL` (server-only) is read at runtime inside Next.js, so it's safe to use the private domain there.

### 5. Verify

```powershell
# Backend health
curl https://<your-back-domain>/api/cms/pages

# Frontend
# Open https://<your-front-domain> in the browser
```

## Demo limitations to flag to the client

- **No background queue/worker** — emails and queued jobs run inline on the request.
- **Ephemeral filesystem** — uploads not stored on Cloudinary are lost on every redeploy.
- **Cold starts** on Railway hobby plan when idle.
