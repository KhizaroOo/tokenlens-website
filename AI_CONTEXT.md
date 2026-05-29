# AI_CONTEXT.md — TokenLens

> **Source of truth for AI agents and future Claude Code sessions.**
> If this file disagrees with a legacy `TOKENLENS_*.md` file at the repo root, **this file wins**. Those legacy files (`TOKENLENS_COMPLETE.md`, `TOKENLENS_FEATURES.md`, `TOKENLENS_HIGHLIGHTS.md`, `TOKENLENS_PROJECT_DOCUMENTATION.md`) are kept for history and should not be relied on for current state.

**Last verified against repo:** 2026-05-29 *(lead-capture verified end-to-end against Neon + Resend email notifier wired via `lib/email.ts`; missing-config path tested — rows still land + `notificationError` flagged, no email sent. Pending real `RESEND_API_KEY` / `EMAIL_FROM` / `LEAD_NOTIFICATION_EMAIL` to graduate from "Implemented" to "Live".)*
**Verified against:** `package.json`, `prisma/schema.prisma`, `app/(*)/`, `app/api/**`, `modules/providers/**`, `workers/**`, `proxy.ts`, `lib/auth.ts`.

---

## 1 · Product summary

TokenLens is a **multi-provider AI usage, spend, productivity, and governance intelligence dashboard** for B2B customers. It connects to provider admin APIs (Anthropic, OpenAI, GitHub Copilot, Cursor, Microsoft 365 Copilot) and unifies cost/usage/seat data into a single editorial dashboard. The public marketing site uses a custom "Signal Gallery" editorial-museum theme.

---

## 2 · Tech stack (verified from `package.json`)

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js App Router | **16.2.6** |
| Runtime | React | 19.2.4 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| Components | shadcn/ui + Base UI | latest |
| Charts | **Recharts only** | 3.8.1 |
| Icons | **Lucide React only** | 1.14.0 |
| DB | PostgreSQL + Prisma | 5.22.0 |
| Auth | `bcryptjs` + `jsonwebtoken` | JWT in `tl_session` cookie |
| Encryption | AES-256-GCM (Node `crypto`) | for provider credentials only |
| Validation | Zod | 4.4.3 |
| Node | 20+ required | — |

There is **no** `middleware.ts`. Next.js 16 uses **`proxy.ts`** at the repo root as the request gate.

---

## 3 · Auth, proxy, session model

| Layer | File | Behaviour |
|---|---|---|
| 1 · Proxy | `proxy.ts` | Edge gate. Matches every request via `config.matcher`. Public-path allow-list lets the 13 marketing routes + `/login` + `/signup` + `/api/auth/login` + `/api/auth/logout` + static assets through. Everything else: unauthenticated page → `307 → /login?redirect=…`; unauthenticated API → `401 JSON`. |
| 2 · Layout guard | `app/(dashboard)/layout.tsx` | Async server component. Calls `getSession()`. If no valid session, `redirect("/login?redirect=…")`. Defence-in-depth. |
| 3 · Route handler | each `app/api/**/route.ts` | Calls `requireSession()` from `lib/auth.ts`. Throws → 401. Filters every DB query by `organizationId`. **Source of truth for data security.** |

Cookie: `tl_session` · JWT (HS256) · `httpOnly` · `secure` in prod · `SameSite=Lax` · 7-day expiry. Verified by `jsonwebtoken.verify`.

---

## 4 · Route inventory summary

Numbers below are verified by `find app -name "page.tsx"` and `find app/api -name "route.ts"`.

| Category | Count |
|---|---|
| Public marketing pages | **13** |
| Public auth pages (`/login`, `/signup`) | **2** |
| **Public website + auth pages — total** | **15** |
| Authenticated portal pages (unique URLs) | **26** |
| API routes — total | **49** |
| API — public | 4 (`/api/auth/login`, `/api/auth/logout`, `/api/contact`, `/api/demo-request`) |
| API — protected | 45 (every other route) |
| Special routes | `app/not-found.tsx`, `app/robots.ts` (`/robots.txt`), `app/sitemap.ts` (`/sitemap.xml`), `app/og/route.tsx` (`/og`) |

Full per-route table lives in [`docs/URL_INVENTORY.md`](docs/URL_INVENTORY.md).

---

## 5 · Provider readiness matrix (verified from code)

| Provider | Key | Category | UI | Connector code | Sync worker | Credential | Production-live |
|---|---|---|---|---|---|---|---|
| Anthropic / Claude | `anthropic` | LLM API | 🟢 Live | ✅ via Admin SDK | ✅ `sync-claude-usage.worker.ts` (225 LOC) | Admin API key | 🟢 **Live** — most mature, used since Phase 1 |
| Claude Code | `claude_code` | Developer AI | 🟢 Live | ✅ reuses Anthropic | ✅ `sync-claude-code.worker.ts` (115 LOC) | Uses Anthropic | 🟢 **Live** |
| OpenAI | `openai` | LLM API | 🟢 Live | ✅ `modules/providers/openai/connector.ts` (90 LOC) | ✅ `sync-openai.worker.ts` (155 LOC) | Admin API key | 🟡 **Implemented — needs verification** (no live customer yet) |
| GitHub Copilot | `github_copilot` | Developer AI | 🟢 Live | ✅ `modules/providers/github_copilot/connector.ts` (138 LOC) | ✅ `sync-github-copilot.worker.ts` (131 LOC) | GitHub App PAT | 🟡 **Implemented — needs verification** |
| Cursor | `cursor` | Developer AI | 🟢 Live | ✅ `modules/providers/cursor/connector.ts` (179 LOC) | ✅ `sync-cursor.worker.ts` (119 LOC) | API key | 🟡 **Implemented — needs verification** |
| Microsoft 365 Copilot | `microsoft_copilot` | Business AI | 🟢 Live | ✅ `modules/providers/microsoft_copilot/connector.ts` (203 LOC) | ✅ `sync-microsoft-copilot.worker.ts` (138 LOC) | Microsoft Graph OAuth | 🟡 **Implemented — needs verification** |
| Gemini | `gemini` | LLM API | 🟢 Live (exhibited on `/limitations`) | ❌ No connector folder | ❌ No worker | n/a | 🚫 **Limited** — no aggregate admin usage API |
| Perplexity | `perplexity` | LLM API | 🟢 Live (exhibited on `/limitations`) | ❌ No connector folder | ❌ No worker | n/a | 🚫 **Limited** — no aggregate admin usage API |

**Honest framing for external-facing copy:**
- Only Anthropic + Claude Code are verifiably live with customer-style data flow today.
- OpenAI, GH Copilot, Cursor, M365 Copilot have shipped connector code and shipped sync workers, but **production validation against a real customer tenant is not yet confirmed in this codebase**. All public copy must say **"implementation present; production validation pending"** — not "live for all providers".
- Gemini and Perplexity are exhibited on `/limitations` because no aggregate admin API exists. Do not market them as "supported".

---

## 6 · Feature status matrix (high level)

Detailed matrix lives in [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md). Summary:

| Phase | Items | Status |
|---|---|---|
| Phase 1 | Anthropic + Claude Code MVP, core dashboard, AI users/teams/models, auth/session, basic settings | 🟢 Live |
| Phase 2A | Multi-provider UI for all 8 providers; provider pages; demo/seed fallback when no creds; public marketing website (Signal Gallery) | 🟢 Live |
| Phase 2B | Production validation of OpenAI/Copilot/Cursor/M365 connectors; Alerts/Reports/Audit Logs/Notifications UIs; real `/contact` + `/demo` backends; real Resources content | 🟡 Mixed — connector + schema code present; customer-facing UI/data flow not yet shipped |
| Phase 3 | AI ROI dashboard, Recommendations/Suggestions engine, intelligence scoring, deeper governance | 🔵 Planned — Prisma tables already exist (`AiAdoptionScoreDaily`, `AiWasteScoreDaily`, `TeamEfficiencyScoreDaily`, `Recommendation`); UI is placeholder |

---

## 7 · Database schema (Prisma)

Verified via `grep "^model " prisma/schema.prisma`. **36 models / enums** present, including Phase 2B/3 tables already designed:

- **Phase 1 core:** `Organization`, `User`, `OrganizationMember`, `Team`, `TeamMember`, `ProviderConnection`, `UsageDaily`, `ModelUsageDaily`, `ClaudeCodeDaily`, `ProviderSyncRun`, `AuditLog`.
- **Phase 2A multi-provider:** `AiUsageDaily`, `AiModelUsageDaily`, `DeveloperAiDaily`, `SeatUsageDaily`, `BusinessAiDaily`, `ProviderUserMapping`.
- **Phase 2B governance:** `Budget`, `AlertRule`, `Alert`, `NotificationChannel`, `NotificationDeliveryLog`, `DataRetentionPolicy`.
- **Phase 3 intelligence:** `AiAdoptionScoreDaily`, `AiWasteScoreDaily`, `TeamEfficiencyScoreDaily`, `Recommendation`, `GitHubRepository`, `GitHubPullRequestDaily`, `GitHubCommitDaily`, `JiraProject`, `JiraIssueDaily`, `ProductivityCorrelationDaily`.

**The schema is ahead of the UI** — Phase 2B/3 tables exist, but most consumers are still placeholders.

---

## 8 · Engineering rules (absolute)

1. **Auth + scope:** every protected API route MUST call `requireSession()` and filter all DB queries by `organizationId`. No exceptions.
2. **No content storage:** never store prompt text, AI responses, or code content. Metadata only.
3. **Charts:** Recharts only — use `CHART_COLORS` from `lib/table-styles.ts`. **Icons:** Lucide React only.
4. **DB:** never modify Phase 1 tables. New tables are additive only.
5. **Demo data:** non-Anthropic providers show demo data from `prisma/seed.ts` until real credentials land. Once a provider's `ProviderConnection` is healthy and a sync run completes, live data replaces demo data automatically.
6. **Design:** emerald + cyan accents only. **Never use purple** in the dashboard — that's Claude.ai's brand color. (Note: `--sg-anomaly` in the marketing Signal Gallery palette currently uses violet `#7C3AED` as one of five accent tones; flagged as a known divergence in `docs/PROJECT_STATUS.md` — replacing it is out of scope without a redesign.)
7. **Fonts:** Plus Jakarta Sans for sans, JetBrains Mono (`font-data`) for every number, cost, and token figure.
8. **Sidebar bg:** `#050810` always.
9. **Page bg:** `#060a12` dark / `#f0f2f7` light. (Marketing pages override via the `.signal-gallery` class wrapper.)

---

## 9 · GTM honesty rules (absolute)

See [`docs/CLAIMS_AND_COPY_GUARDRAILS.md`](docs/CLAIMS_AND_COPY_GUARDRAILS.md) for the canonical list. Short version:

- **Never claim** SOC 2 / ISO 27001 certification (not held).
- **Never claim** specific customers, logos, testimonials, or case studies (none exist).
- **Never claim** "live sync across all 7/8 providers" — only Anthropic + Claude Code are verifiably live.
- **Never claim** Slack / Teams / PagerDuty / email alert delivery as shipped end-to-end — schema and stubs exist, delivery is not wired in customer-visible UI.
- **Never claim** specific savings percentages ("15-30%", "12-22%", etc.) — unsourced.
- **Never claim** "board-ready PDF reports" or "one-click reclaim" — neither shipped.
- **OK to say:** "provider coverage may vary by plan, API access, and customer environment", "implementation present; production validation pending", "Coming Soon", "Roadmap", "Preview".

---

## 10 · Public marketing website

| Detail | State |
|---|---|
| Theme | Signal Gallery (editorial museum) — scoped via `.signal-gallery` class wrapper in `app/(marketing)/layout.tsx`. Light + dark mode via CSS variables. |
| Total public marketing pages | 13 (`/`, `/platform`, `/solutions`, `/use-cases`, `/integrations`, `/pricing`, `/security`, `/resources`, `/about`, `/contact`, `/demo`, `/privacy`, `/terms`) |
| Header / footer | `components/marketing/MarketingHeader.tsx` + `MarketingFooter.tsx`. Header is fixed with scroll-aware blur. Mobile menu has `aria-label` and `aria-expanded`. Theme toggle has `aria-label`. |
| Dashboard preview | `components/marketing/DashboardMockup.tsx` renders the real product dashboard screenshots from `public/screenshots/dashboard-{light,dark}.png` (theme-aware swap). Falls back to a placeholder card if the PNG is missing. |
| Forms | `/contact` POSTs to `/api/contact` (persists to `ContactSubmission`). `/demo` POSTs to `/api/demo-request` (persists to `DemoRequest`). Both rate-limited (5/min/IP), zod-validated, **honeypot-protected**, and store **only an `ipHash`** — no raw IP. After persistence, both endpoints fire-and-forget an email via `lib/email.ts` (Resend) to `LEAD_NOTIFICATION_EMAIL` and write the outcome to `notificationSentAt` / `notificationError` on the row. **Email failure NEVER blocks lead capture** — submissions always return 200 if the DB write succeeded. Mailto fallback still offered as secondary. |
| Resources | All 6 article cards are previews labeled "COMING SOON" with a "LIBRARY IN CURATION" disclosure block. |
| SEO | All 13 pages have `<title>` + `description`. Homepage has full OpenGraph + Twitter card + keywords. `/contact` and `/demo` use sibling server `layout.tsx` for metadata. `app/robots.ts` serves `/robots.txt` (allows marketing, disallows portal + API). `app/sitemap.ts` serves `/sitemap.xml` (13 public URLs). OG images use the idiomatic Next.js `opengraph-image.tsx` convention: `app/opengraph-image.tsx` (default), `app/(marketing)/contact/opengraph-image.tsx`, `app/(marketing)/demo/opengraph-image.tsx`. All three render at edge runtime via shared `lib/og-render.tsx`. Canonical site URL resolved by `lib/site.ts` from `NEXT_PUBLIC_SITE_URL` / `APP_URL` env vars; falls back to `https://tokenlens.ai` in production builds with no env. |
| Animations | CSS-only (`sg-pulse`, `sg-orbit-slow`, `sg-orbit-med`). All disabled under `prefers-reduced-motion`. |
| Dashboard screenshots | Live PNGs in `public/screenshots/`. Replace by saving new captures at the same path. |

Per-page content inventory: [`docs/WEBSITE_CONTENT.md`](docs/WEBSITE_CONTENT.md).

---

## 11 · Authenticated portal

26 unique URLs under `app/(dashboard)/`. All gated by `proxy.ts` + `app/(dashboard)/layout.tsx`. Per-page status table lives in [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md) and [`docs/URL_INVENTORY.md`](docs/URL_INVENTORY.md).

Module folders that exist today:
```
app/(dashboard)/
  dashboard/                                  Phase 1 main overview
  ai-users/, ai-teams/, ai-models/            Phase 1 + [param] detail pages
  claude-code/                                Phase 1 dedicated page
  developer-ai-tools/
    claude-code/, cursor/, github-copilot/    Phase 2A
  llm-spend/
    claude/, openai/                          Phase 2A
  business-productivity-ai/
    microsoft-copilot/                        Phase 2A
  providers/                                  Phase 2A — connection list
  settings/                                   Live — credentials, budgets, sync
  limitations/                                Live — Gemini + Perplexity exhibit
  alerts/, reports/, audit-logs/, notifications/    Phase 2B placeholders
  roi/, suggestions/                          Phase 3 placeholders
```

---

## 12 · Local setup (quick reference)

```bash
# 1. Postgres
docker-compose up -d

# 2. Install + push schema + seed
npm install
npm run db:push
npm run db:seed

# 3. Dev server
npm run dev               # http://localhost:3000

# Demo login (from seed):
#   admin@tokenlens.ai / admin123
```

Required env vars: see [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

---

## 13 · What NOT to change without approval

| Area | Reason |
|---|---|
| `proxy.ts` public-path allow-list | Mistake here = either dashboard leaks publicly, or marketing site goes dark. |
| `app/(dashboard)/layout.tsx` session guard | Second auth layer. Don't remove. |
| `lib/auth.ts` cookie name / JWT shape | Active sessions break. |
| Phase 1 Prisma tables (`UsageDaily`, `ModelUsageDaily`, `ClaudeCodeDaily`, etc.) | Live data references them. New columns are fine via migration. |
| Signal Gallery theme variables in `app/globals.css` | Marketing site visual identity. |
| `next.config.ts` security headers | Production hardening. |
| Provider registry shape (`ProviderDefinition`) | UI + Settings + Sync all assume the current interface. |

---

## 14 · Documentation hierarchy

When AI agents need context, read in this order:

1. **This file** (`AI_CONTEXT.md`) — current state, must be up to date.
2. **`CLAUDE.md`** — short pointer + behaviour guardrails for Claude Code sessions.
3. **`README.md`** — onboarding / public-facing setup.
4. **`docs/PROJECT_STATUS.md`** — current readiness snapshot.
5. **`docs/URL_INVENTORY.md`** + **`docs/FEATURE_MATRIX.md`** — granular.
6. **`docs/GTM_READINESS.md`** + **`docs/CLAIMS_AND_COPY_GUARDRAILS.md`** — what can be said publicly.
7. **`docs/ROADMAP.md`** — what's next.
8. **`docs/DEPLOYMENT.md`** + **`docs/ENVIRONMENT.md`** — how to ship it.
9. **`docs/WEBSITE_CONTENT.md`** — marketing site copy reference.
10. **`docs/DOCS_INDEX.md`** — map of everything.

Anything in `TOKENLENS_*.md` (4 legacy files at repo root) — treat as historical context only. Do not propagate claims from there into new copy without re-verification.
