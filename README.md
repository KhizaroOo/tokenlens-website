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

Needs a Node runtime + Postgres for lead capture (Vercel, Railway, Render, etc.). Set the env vars above. Set `NEXT_PUBLIC_SITE_URL` so SEO files point at the canonical domain, and `NEXT_PUBLIC_PORTAL_URL` so the login/signup links reach the portal.

---

## Content source of truth

All claims, provider readiness wording, roadmap, and security statements are aligned to **`tokenlens-idea`** (`AI_CONTEXT.md`, `docs/WEBSITE_CONTENT.md`, `docs/CLAIMS_AND_COPY_GUARDRAILS.md`). If content conflicts with those docs, **the docs win**.

Provider readiness: Claude + Claude Code **Live**; OpenAI / GitHub Copilot / Cursor / Microsoft 365 Copilot **connector implemented, validation pending**; Gemini / Perplexity **limited (no aggregate admin API)**. No SOC 2 claim, no customers/logos/testimonials, no unsourced savings percentages, no calendar booking or Slack/Teams/PagerDuty claims.
