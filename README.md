# TokenLens — Website

The **public marketing website** for TokenLens — an AI spend, usage, productivity, and governance intelligence platform.

> **Main message:** *Control your company's AI spend before it becomes your next cloud bill.*

This repo is **public pages only**. The authenticated application portal (dashboard, provider sync, settings) lives in a **separate** deployment — `tokenlens-idea`. This site links to it; it never contains portal code.

---

## What's in here

| Area | Routes |
|---|---|
| Marketing (13) | `/`, `/platform`, `/solutions`, `/use-cases`, `/integrations`, `/pricing`, `/security`, `/resources`, `/about`, `/contact`, `/demo`, `/privacy`, `/terms` |
| Portal links | `/login`, `/signup` — link to the portal deployment (no credentials handled here) |
| Lead capture API | `POST /api/contact`, `POST /api/demo-request` |
| SEO | `/robots.txt`, `/sitemap.xml`, `opengraph-image` (root + `/contact` + `/demo`) |

There is **no** `/dashboard`, no protected APIs, no provider connectors, no sync workers, and no `proxy.ts` — those belong to the portal repo.

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma (lead capture only) · Recharts + Lucide.

- **Theme:** *Signal Gallery* — museum-black dark + warm off-white light, emerald/cyan accents. Dark/light via `next-themes` (toggle in the header).
- **Responsive:** fluid layouts, verified down to 320px.
- Shared visual identity with the marketing deck in `tokenlens-marketing`.

---

## Quick start

```bash
npm install
cp .env.example .env     # fill in DATABASE_URL + JWT_SECRET (+ optional email/portal vars)
npx prisma generate
npm run dev              # http://localhost:3000
```

```bash
npm run build            # production build
npm start                # serve the production build
```

---

## Lead capture & email

`/contact` and `/demo` POST to `/api/contact` and `/api/demo-request`:

- Zod-validated, rate-limited (5/min/IP), honeypot-protected.
- Persist to Postgres (`ContactSubmission` / `DemoRequest`). Only a **hashed IP** is stored — never the raw IP.
- After persistence, a **fire-and-forget** email notification is sent via Resend to `LEAD_NOTIFICATION_EMAIL`. **Email never blocks lead capture** — if email env is missing, the row still persists and is flagged `notificationError = "missing_config:…"`.

### Lead notification recipient

```
LEAD_NOTIFICATION_EMAIL=khizar.imtiaz@gmail.com
```

To actually deliver email, also set `RESEND_API_KEY` and `EMAIL_FROM` (a Resend-verified sender/domain). **Do not commit a real `RESEND_API_KEY`.** Until configured, email notification status is *"implemented, pending email env configuration."*

### Honest fallback

If you deploy this site **without** a database/backend (e.g. a static host), the forms cannot persist. In that case route users to `mailto:khizar.imtiaz@gmail.com` rather than faking a submission.

---

## Environment variables

See [`.env.example`](.env.example). Summary:

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | for lead capture | Postgres connection (lead rows) |
| `JWT_SECRET` | recommended | Salt for hashing lead-capture IPs |
| `LEAD_NOTIFICATION_EMAIL` | for email | Where new leads are emailed (`khizar.imtiaz@gmail.com`) |
| `RESEND_API_KEY`, `EMAIL_FROM` | for email delivery | Resend transactional email |
| `NEXT_PUBLIC_SITE_URL` | prod | Canonical origin for robots/sitemap/OG |
| `NEXT_PUBLIC_PORTAL_URL` | optional | Portal origin — `/login` + `/signup` link here |

---

## Deployment

Two supported modes:

### A · Node host — full site **with working lead capture** (recommended)

Vercel / Railway / Render / self-hosted. Set the env vars above. `/api/contact` + `/api/demo-request` persist to Postgres and (if `RESEND_API_KEY` + `EMAIL_FROM` are set) email `LEAD_NOTIFICATION_EMAIL`. Set `NEXT_PUBLIC_SITE_URL` for canonical SEO and `NEXT_PUBLIC_PORTAL_URL` for the login/signup links.

```bash
npm run build && npm start
```

### B · GitHub Pages — static export (marketing only)

GitHub Pages serves **static files only** — it cannot run the API routes or Prisma. The included workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) handles this:

- Removes `app/api` (POST handlers can't be statically exported).
- Builds with `NEXT_OUTPUT_MODE=export` and `NEXT_PUBLIC_BASE_PATH=/tokenlens-website` (project-Pages subpath).
- Sets `NEXT_PUBLIC_LEAD_CAPTURE_MODE=mailto`, so the contact/demo forms **compose an email to `khizar.imtiaz@gmail.com`** instead of POSTing to a backend that isn't there — **no fake submissions**.
- Adds `.nojekyll` so the `_next/` folder is served.

Enable it in **repo → Settings → Pages → Source: GitHub Actions**, then push to `main`. Live URL: `https://<owner>.github.io/tokenlens-website/`.

> On Pages there is **no database** — leads arrive by email only. For DB-backed capture + server email, use mode A. Reproduce the static build locally with:
> ```bash
> rm -rf app/api
> NEXT_OUTPUT_MODE=export NEXT_PUBLIC_BASE_PATH=/tokenlens-website NEXT_PUBLIC_LEAD_CAPTURE_MODE=mailto npm run build   # → ./out
> ```

---

## Content source of truth

All claims, provider readiness wording, roadmap, and security statements are aligned to **`tokenlens-idea`** (`AI_CONTEXT.md`, `docs/WEBSITE_CONTENT.md`, `docs/CLAIMS_AND_COPY_GUARDRAILS.md`). If content conflicts with those docs, **the docs win**.

Provider readiness: Claude + Claude Code **Live**; OpenAI / GitHub Copilot / Cursor / Microsoft 365 Copilot **connector implemented, validation pending**; Gemini / Perplexity **limited (no aggregate admin API)**. No SOC 2 claim, no customers/logos/testimonials, no unsourced savings percentages, no calendar booking or Slack/Teams/PagerDuty claims.
