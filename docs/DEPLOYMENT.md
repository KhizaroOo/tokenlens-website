# DEPLOYMENT.md

> How to ship TokenLens. Verified on **2026-05-28**.
> See also: [`GITHUB_PAGES_DEPLOYMENT.md`](GITHUB_PAGES_DEPLOYMENT.md) for the disabled GH Pages workflow specifics.

---

## 1 · Deployment modes

TokenLens supports two build modes via `next.config.ts`:

| Mode | Trigger | What ships | What's missing |
|---|---|---|---|
| **Server mode** (default) | `npm run build` | Marketing site + dashboard + API routes + `proxy.ts` + Prisma | — |
| **Static export** | `NEXT_OUTPUT_MODE=export npm run build` | Marketing pages only (HTML/CSS/JS) | API routes, `proxy.ts`, auth cookies, Prisma, login/sync — **none of these run on a static host** |

**Rule of thumb:** if you want anyone to actually log in or see live data, use server mode. Static export is only for a marketing-only deploy (e.g. GitHub Pages teaser).

---

## 2 · GitHub Pages limitation (important)

GitHub Pages **cannot** run any of:

- `proxy.ts` (no edge runtime)
- `app/api/**/route.ts` (no Node runtime)
- `tl_session` cookie auth (no server to set/read)
- Prisma client (no DB connection at request time)
- Sync workers (no scheduler)
- Provider credential encryption/decryption (no server-side `ENCRYPTION_KEY`)

What GH Pages **can** do: serve the static-exported marketing site (13 pages + assets). All "Login" / "Book Demo" buttons either link off-site or render inert form previews.

The GH Pages workflow file exists at `.github/workflows/deploy-pages.yml.disabled` — **rename to `.yml` only if you accept the marketing-only constraint**.

---

## 3 · Recommended production hosts (for the full app)

The full app needs a Node runtime + PostgreSQL. Any of these work:

| Host | Notes |
|---|---|
| **Vercel** | Best Next.js compatibility. Native support for App Router, edge proxy, ISR. Requires external Postgres (Neon, Supabase, etc.). |
| **Railway** | One-click Postgres + app. Good for early-stage. |
| **Render** | Similar to Railway. |
| **DigitalOcean App Platform** | Solid. Managed Postgres available. |
| **AWS** (Amplify Hosting / ECS / EKS) | Most control; most operational overhead. |
| **Azure App Service** | Useful if customer base is Microsoft-heavy (M365 Copilot connector). |
| **Self-hosted Node** | Standalone build via `next build` + `next start`. Reverse-proxy with nginx/Caddy. |

---

## 4 · Required services in production

| Service | Purpose | Suggested provider |
|---|---|---|
| Node 20+ runtime | App server | Whichever host above |
| PostgreSQL 14+ | Data store | Neon (serverless), Supabase, AWS RDS, etc. |
| HTTPS / TLS | Cookie security | Host typically handles this |
| Background scheduler (cron) | Periodic provider syncs | Host cron, GitHub Actions cron, or a worker like Railway / Render cron jobs |
| **Transactional email** | Lead-capture notification delivery (`lib/email.ts` calls Resend) | **Resend** (`RESEND_API_KEY`); requires a verified sending domain |
| Error tracking (recommended) | Production observability | Sentry, Logtail, Datadog |
| Object storage (optional) | Future PDF report exports | S3, R2 |

---

## 5 · Required environment variables

Full reference in [`ENVIRONMENT.md`](ENVIRONMENT.md). Production must set at minimum:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ random bytes, base64>
ENCRYPTION_KEY=<32+ random bytes, base64>
```

Build-only (used by `next.config.ts`):

```bash
NEXT_OUTPUT_MODE=             # set to "export" only for static marketing build
NEXT_PUBLIC_BASE_PATH=        # set to "/subpath" only if hosted under a subpath
```

---

## 6 · Build commands

```bash
# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Production build (server mode — default)
npm run build

# Production start (after build)
npm start

# Static export build (marketing-only)
NEXT_OUTPUT_MODE=export npm run build
# Result: ./out/ directory
```

---

## 6-bis · Lead-capture schema migration — ✅ applied to Neon

The `ContactSubmission` and `DemoRequest` tables added during the launch-blocker pass have been **applied to the connected Neon database** via `npm run db:push`, and end-to-end verification (valid POST → 200 + DB row landed) has been confirmed. No migration action is required for the current environment.

For **future production hosts** (a different Postgres instance), run the same command before deploying the endpoints:

| Environment | Command | Notes |
|---|---|---|
| Local dev / new staging DB | `npm run db:push` | Idempotent. Safe to re-run. |
| Production (no migrations folder) | `npm run db:push` once | First-time setup only. Switch to `prisma migrate` for subsequent changes. |
| Production (with migrations folder) | `npx prisma migrate dev --name add_lead_capture_tables` locally → commit → `npx prisma migrate deploy` in CI | Recommended for any environment with real customer data. |

## 7 · Database / Prisma deploy

```bash
# Generate Prisma client (run on every deploy after install)
npx prisma generate

# Apply migrations (production)
npx prisma migrate deploy

# Or for dev / first-time setup:
npm run db:push    # equivalent to: npx prisma db push

# Seed (only on a fresh DB)
npm run db:seed
```

**Important:** never run `db:push` against a production DB with real customer data. Use `prisma migrate` flow:

1. Locally: `npx prisma migrate dev --name <description>` creates a migration in `prisma/migrations/`.
2. Commit the migration directory.
3. On deploy: CI runs `npx prisma migrate deploy`.

---

## 8 · Auth / session secret notes

| Variable | Generation | Rotation policy |
|---|---|---|
| `JWT_SECRET` | `openssl rand -base64 32` | Rotating invalidates all sessions (forces re-login). OK to rotate quarterly or on incident. |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` | **Cannot rotate without re-encrypting every `ProviderConnection` credential.** Plan a migration script before rotating. |

Both must be set per environment. Never commit either to git. Never reuse dev keys in production.

---

## 9 · Provider credentials in production

Provider API keys are **entered through the Settings UI**, encrypted with AES-256-GCM in `lib/encryption.ts`, and stored in `ProviderConnection.encryptedCredentials`. They are decrypted only inside sync workers when calling provider APIs.

In production:

- `ENCRYPTION_KEY` must be set and stable.
- No provider key should ever land in env vars.
- The Settings UI requires a logged-in admin.

---

## 10 · Security headers

`next.config.ts` adds these on every server-mode response:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Static-export builds **cannot** apply headers — configure them at the host (Vercel headers, nginx, etc.) if shipping marketing statically.

---

## 11 · Recommended deploy checklist

### 11a · Pre-deploy
- [ ] All env vars set in production environment.
- [ ] Production Postgres provisioned and reachable.
- [ ] `prisma migrate deploy` runs successfully against production DB.
- [ ] `npx tsc --noEmit` and `npm run build` pass in CI.
- [ ] At least one smoke-test login works against the staging URL.
- [ ] Provider credentials added via Settings UI; one sync run completes.

### 11b · Deploy
- [ ] Health-check endpoint or `/api/auth/me` returns 401 (proves the API is up and auth is wired).
- [ ] Marketing pages serve 200.
- [ ] Dashboard URL serves 307 → `/login` when unauthenticated.
- [ ] Login flow works end-to-end.

### 11c · Post-deploy
- [ ] Schedule provider sync cron jobs.
- [ ] Enable error tracking (Sentry, etc.).
- [ ] Take fresh dashboard screenshots for `public/screenshots/` if the UI has changed.
- [ ] Update `docs/PROJECT_STATUS.md` with the deploy date and host.

---

## 12 · Smoke-test commands (run from `tokenlens-idea`)

```bash
PORT=3411
npx next start --port $PORT &
sleep 4

# Public pages — expect 200
for path in / /platform /pricing /demo /contact /login; do
  curl -s -o /dev/null -w "$path → %{http_code}\n" "http://localhost:$PORT$path"
done

# Protected pages — expect 307 → /login
for path in /dashboard /settings /providers; do
  curl -s -o /dev/null -w "$path → %{http_code}\n" "http://localhost:$PORT$path"
done

# Protected API — expect 401
for path in /api/dashboard /api/auth/me /api/providers; do
  curl -s -o /dev/null -w "$path → %{http_code}\n" "http://localhost:$PORT$path"
done
```

If any of these don't return the expected codes, **do not ship** — the auth boundary is broken.
