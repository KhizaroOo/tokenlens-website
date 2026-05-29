# GitHub Pages Deployment

> Deploys TokenLens to GitHub Pages as a static site. Marketing pages work fully;
> portal pages render their UI shells but backend-dependent features are inert
> (GH Pages is static hosting — no Node.js server, no database, no API routes).

---

## What works on GH Pages

| Surface | Works? | Notes |
|---|---|---|
| Marketing site (`/`, `/platform`, `/solutions`, `/pricing`, etc.) | ✅ Fully | All 14 pages render and navigate normally |
| Theme toggle (light/dark) | ✅ | `localStorage` is client-side |
| Mobile menu, active nav state | ✅ | Pure client logic |
| Portal UI shells (`/dashboard`, `/settings`, `/ai-users`, etc.) | ⚠️ Renders only | Empty state because backend fetches 404 |
| Login form | ❌ | `/api/auth/login` doesn't exist on GH Pages |
| Provider sync, data fetches | ❌ | All `/api/*` routes are excluded during build |
| Demo / Contact forms | ❌ | No backend to receive submissions |

## How it deploys

A push to `main` triggers `.github/workflows/deploy-pages.yml`, which:

1. Installs dependencies
2. Runs `npx prisma generate` (for type imports only)
3. Renames `app/api/` to `.api_disabled_for_build/` (static export can't ship API routes)
4. Runs `npx next build` with `NEXT_OUTPUT_MODE=export`
5. Uploads the resulting `out/` folder as a GitHub Pages artifact
6. Deploys to Pages
7. Restores `app/api/` (in case the runner is reused)

The workflow auto-detects the basePath from `actions/configure-pages` — works the same whether deployed to a project page (`/repo-name`) or a custom domain.

## Setup (one-time)

1. **Enable Pages**:
   GitHub repo → Settings → Pages → Source: **GitHub Actions**

2. **First deploy**:
   Push to `main`, or run "Deploy to GitHub Pages" manually from the Actions tab

3. **Custom domain (optional)**:
   GitHub repo → Settings → Pages → Custom domain
   Add a `CNAME` file with your domain to `public/`

## Running the static build locally

```bash
# Disable API routes
mv app/api .api_disabled

# Build
NEXT_OUTPUT_MODE=export NEXT_PUBLIC_BASE_PATH=/tokenlens-idea npx next build

# Output is in ./out
npx serve out  # or any static file server

# Restore
mv .api_disabled app/api
```

## For the real portal (backend functional)

Deploy the same codebase to **Vercel, Render, Fly.io, or any Node.js host** without setting `NEXT_OUTPUT_MODE=export`. The `next.config.ts` is conditional — by default (no env var) it runs as a full Next.js server with API routes, Prisma, and JWT auth.

```bash
# Standard build (full server features)
npm run build
npm start
```

## Architecture summary

| Component | GH Pages | Vercel/Node host |
|---|---|---|
| Marketing site | ✅ | ✅ |
| Portal UI | ✅ (shells only) | ✅ |
| API routes | ❌ excluded | ✅ |
| Prisma DB | ❌ no Node runtime | ✅ |
| Sync workers | ❌ | ✅ (background jobs) |
| Auth | ❌ | ✅ (JWT cookies) |

**Recommended setup:** GH Pages for the public marketing site, Vercel (or similar) for the portal — pointing the marketing site's CTAs to the production portal URL.
