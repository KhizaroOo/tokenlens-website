# TokenLens

**AI Usage, Token Cost, Productivity & Governance Intelligence Dashboard**

TokenLens gives organisations a single editorial dashboard for every AI tool their teams use — LLM API spend (Claude, OpenAI), developer coding assistants (Claude Code, GitHub Copilot, Cursor), and business productivity AI (Microsoft 365 Copilot).

> 📚 **Documentation:** This README is for onboarding. For current product state, route inventory, provider readiness, GTM guardrails, and roadmap, start at [`AI_CONTEXT.md`](AI_CONTEXT.md) and [`docs/DOCS_INDEX.md`](docs/DOCS_INDEX.md).

---

## Status snapshot

- **Phase 1 — 🟢 Live:** Anthropic Claude + Claude Code with real Admin-API data flow.
- **Phase 2A — 🟢 UI complete, 🟡 backend verification pending:** Multi-provider UI shipped for OpenAI, GitHub Copilot, Cursor, Microsoft 365 Copilot. Connector + sync-worker **code is in the repo**, but production validation against a real customer tenant is not yet confirmed. Non-Anthropic providers show seeded demo data until credentials are added in Settings.
- **Phase 2B — 🔵 Coming Soon:** Alerts, Reports, Audit Logs, Notifications (placeholders shipped; data plumbing partial).
- **Phase 3 — ⚪ Planned:** ROI dashboard, Recommendations/Suggestions engine, intelligence scoring (Prisma tables exist; UI is placeholder).
- **Public marketing website — 🟢 Live (Signal Gallery theme).** `/contact` and `/demo` POST to real persistence endpoints (`/api/contact`, `/api/demo-request`) — verified end-to-end against Neon Postgres. SEO infrastructure live: `robots.txt`, `sitemap.xml`, per-page OG images via `opengraph-image.tsx` convention. Email notification + calendar booking still manual; mailto fallback shown as secondary. `/resources` articles remain **previews** labeled COMING SOON.

Full breakdown: [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md).

---

## Feature matrix (high level)

| Area | What's there today | Status |
|---|---|---|
| Dashboard | Provider cards, 30-day cost, live status | 🟢 Live |
| AI Users / Teams / Models | Per-entity usage, cost, trend; `[id]` detail pages | 🟢 Live |
| Claude (Anthropic) | Full token + cost breakdown via Admin API | 🟢 Live |
| Claude Code | Sessions, tokens, cost per developer | 🟢 Live |
| OpenAI / GitHub Copilot / Cursor / M365 Copilot | UI shipped, connector + sync worker present | 🟡 Needs production verification |
| Gemini / Perplexity | Exhibited on `/limitations` (no aggregate admin API) | 🚫 Limited |
| Alerts, Reports, Audit Logs, Notifications | Placeholder pages + Prisma tables | 🔵 Coming Soon |
| ROI, Suggestions | Placeholder pages + Prisma tables | ⚪ Planned |
| Settings, Provider Limits | Credential storage, sync controls | 🟢 Live |
| Marketing website (13 pages) | Signal Gallery theme; SEO; responsive | 🟢 Live |
| `/contact`, `/demo` → real persistence endpoints | `/api/contact`, `/api/demo-request` (zod + rate-limit + Prisma) | 🟢 Live |
| `/resources` library | Article previews, no MDX collection yet | 🟠 Preview |
| `/robots.txt`, `/sitemap.xml`, dynamic `/og` (1200×630) | SEO + sharing infrastructure | 🟢 Live |

Per-page detail: [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md). Per-URL inventory: [`docs/URL_INVENTORY.md`](docs/URL_INVENTORY.md).

---

## Tech stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js App Router | **16.2.6** |
| Runtime | React | 19.2.4 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| Components | shadcn/ui + Base UI | latest |
| Charts | Recharts | 3.8.1 |
| Icons | Lucide React | 1.14.0 |
| Database | PostgreSQL + Prisma ORM | 5.22.0 |
| Auth | `bcryptjs` + JWT (httpOnly `tl_session` cookie, 7d) | — |
| Encryption | AES-256-GCM via Node `crypto` (provider credentials only) | — |
| Validation | Zod | 4.4.3 |

Next.js 16 uses **`proxy.ts`** at the repo root instead of `middleware.ts`.

---

## Route groups overview

```
app/(marketing)/    13 public pages — Signal Gallery theme
app/(auth)/         /login + /signup — public
app/(dashboard)/    26 protected portal pages — sidebar layout
app/api/            47 API routes — 2 public auth + 45 protected
app/not-found.tsx   404
```

Auth boundary, in one diagram:

```
PUBLIC:     13 marketing + /login + /signup + /api/auth/{login,logout} + static
PROTECTED:  26 dashboard pages (307 → /login)  +  45 API routes (401 JSON)
```

Enforced by **three layers**: `proxy.ts` (edge gate) → `app/(dashboard)/layout.tsx` (server guard) → each `app/api/**/route.ts` calls `requireSession()` and filters every query by `organizationId`.

---

## Quick start

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)

### 1 · Install

```bash
git clone https://github.com/KhizaroOo/tokenlens-idea.git
cd tokenlens-idea
npm install
```

### 2 · Environment variables

Copy `.env.example` (if present) to `.env`, then fill in:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tokenlens"
JWT_SECRET="<run: openssl rand -base64 32>"
ENCRYPTION_KEY="<run: openssl rand -base64 32>"
```

Full reference: [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

### 3 · Database

```bash
docker-compose up -d           # PostgreSQL
npm run db:push                # apply Prisma schema
npm run db:seed                # seed demo data (admin@tokenlens.ai / admin123)
```

### 4 · Dev server

```bash
npm run dev                    # http://localhost:3000
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run validate:providers` | Run `scripts/validate-provider-integrations.ts` |
| `npx tsc --noEmit` | Type-check |
| `docker-compose up -d` | Start PostgreSQL container |

---

## Connecting real provider data

Once the app is running with demo data, add credentials in **Settings → Provider Integrations**. The connector code is in `modules/providers/<provider>/connector.ts` and the sync worker is in `workers/sync-<provider>.worker.ts`.

| Provider | Credential | Connector status |
|---|---|---|
| Anthropic / Claude | Admin API key (`sk-ant-admin-…`) | 🟢 Live |
| Claude Code | Uses Anthropic | 🟢 Live |
| OpenAI | Admin API key | 🟡 Implementation present, customer-verified status pending |
| GitHub Copilot | PAT with `manage_billing:copilot` + org name | 🟡 Implementation present, customer-verified status pending |
| Cursor | Admin API key | 🟡 Implementation present, customer-verified status pending |
| Microsoft 365 Copilot | Entra App Registration (Tenant + Client ID + Secret) | 🟡 Implementation present, customer-verified status pending |
| Gemini | n/a | 🚫 Limited — no aggregate admin usage API |
| Perplexity | n/a | 🚫 Limited — no aggregate admin usage API |

Walk-through: [`docs/PROVIDER_SETUP_GUIDE.md`](docs/PROVIDER_SETUP_GUIDE.md).

---

## Known limitations

| Area | Limitation |
|---|---|
| Gemini, Perplexity | No aggregate admin usage API; shown on `/limitations` |
| `/contact`, `/demo` | POST endpoints live and **verified end-to-end against Neon Postgres**. Email notifier wired via Resend (`lib/email.ts`) — fire-and-forget, never blocks lead capture. Currently 🟡 Implemented — pending `RESEND_API_KEY` + `EMAIL_FROM` + `LEAD_NOTIFICATION_EMAIL` env to deliver. Until then, submissions still persist; row's `notificationError` flags missing config. Calendar booking still manual. |
| `/resources` | Article cards are previews labeled COMING SOON; MDX/blog collection not yet shipped |
| Alerts / Reports / Audit Logs / Notifications | Placeholder pages; Prisma tables exist, delivery channels not wired |
| ROI / Suggestions | Placeholder pages; intelligence-score Prisma tables exist, scoring engine pending |
| SOC 2 / ISO 27001 | Not held; do not claim in any marketing copy |
| GitHub Pages workflow | `.github/workflows/deploy-pages.yml.disabled` — GH Pages cannot run `proxy.ts`, API routes, or Prisma |

Full GTM-safe copy guardrails: [`docs/CLAIMS_AND_COPY_GUARDRAILS.md`](docs/CLAIMS_AND_COPY_GUARDRAILS.md).

---

## Deployment

- **GitHub Pages** can only host the marketing site (static export, no proxy/API/Prisma).
- **Full app** requires a Node-capable host: Vercel, Railway, Render, DigitalOcean, AWS, Azure, etc.

Details: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Documentation map

| Doc | Purpose |
|---|---|
| [`AI_CONTEXT.md`](AI_CONTEXT.md) | Source of truth for AI agents and Claude Code |
| [`CLAUDE.md`](CLAUDE.md) | Short behavioural guide for Claude Code sessions |
| [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) | Current readiness snapshot |
| [`docs/URL_INVENTORY.md`](docs/URL_INVENTORY.md) | Every route, counted accurately |
| [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md) | Per-feature status |
| [`docs/PROVIDER_SETUP_GUIDE.md`](docs/PROVIDER_SETUP_GUIDE.md) | Walk-through for each provider's credential |
| [`docs/GTM_READINESS.md`](docs/GTM_READINESS.md) | What's safe to show prospects / investors / customers |
| [`docs/CLAIMS_AND_COPY_GUARDRAILS.md`](docs/CLAIMS_AND_COPY_GUARDRAILS.md) | Marketing language rules |
| [`docs/WEBSITE_CONTENT.md`](docs/WEBSITE_CONTENT.md) | Per-marketing-page content inventory |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phase plan |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Hosting + deploy notes |
| [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) | Env-var reference |
| [`docs/DOCS_INDEX.md`](docs/DOCS_INDEX.md) | Map of all docs by audience |

Legacy docs (`TOKENLENS_COMPLETE.md`, `TOKENLENS_FEATURES.md`, `TOKENLENS_HIGHLIGHTS.md`, `TOKENLENS_PROJECT_DOCUMENTATION.md`) are kept for history. Use the docs above instead.

---

## Demo login

```
admin@tokenlens.ai / admin123
```

---

## License

Internal / proprietary. Not for public distribution.
