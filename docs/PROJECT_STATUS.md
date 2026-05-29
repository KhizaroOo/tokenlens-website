# PROJECT_STATUS.md

> Current snapshot of what's live, what's pending, what's coming, and known gaps.
> Verified against the repo on **2026-05-28**.

---

## 1 · Status legend

| Label | Meaning |
|---|---|
| 🟢 Live | Implemented + verified working in the codebase. Safe for stakeholder/investor demo. |
| 🟡 Implemented — needs verification | Code exists in the repo; production / live-customer validation pending. |
| 🟠 Preview | UI exists; backend not wired. Honest disclosure shown in-UI. |
| 🔵 Coming Soon | Placeholder route/page shipped; Phase 2B work. |
| ⚪ Planned | Phase 3 work; Prisma table or stub present at most. |
| 🚫 Disabled / Limited | Not supported (e.g. upstream has no API) or workflow disabled. |
| 🔒 Protected | Authenticated route. |
| 🌐 Public | Accessible without auth. |

---

## 2 · Readiness scorecard

| Domain | Score / 10 | Notes |
|---|---|---|
| Public marketing website | **8.5** | All 13 pages live, theme polished, screenshots wired, SEO complete with sitemap + robots + dynamic OG; `/resources` still preview content. |
| Auth & access control | **9.5** | Three-layer enforcement (proxy + layout + handler) verified end-to-end. Smoke-tested last session. |
| Dashboard portal | **7.5** | 20 of 26 routes 🟢 Live; 4 Phase 2B placeholders; 2 Phase 3 placeholders. |
| API surface | **7.5** | 45 protected routes wired; `/api/contact` and `/api/demo-request` public lead-capture endpoints live with zod + rate-limit + Prisma persistence. |
| Provider integrations | **6.5** | 2 of 8 providers verifiably live (Anthropic, Claude Code). 4 implemented but unverified. 2 limited. |
| Forms / lead capture | **8.5** | Real `/api/contact` and `/api/demo-request` POST endpoints **verified end-to-end against Neon** — valid POST → 200 + DB row landed; honeypot → 200 + no row; rate limit → 429 after 5/min; invalid email → 400; GET → 405. ipHash stored (not raw IP). Email/calendar delivery still manual until provider configured. |
| Resources / blog | **3.5** | UI shipped; content collection not yet built. |
| SEO | **9.0** | Metadata on all pages, OG/Twitter on homepage + contact + demo. `/robots.txt`, `/sitemap.xml`, and dynamic `/og` image all live. Set `NEXT_PUBLIC_SITE_URL` in prod for canonical absolute URLs. |
| Deployment | **5.0** | Server build works; static-export config present; GH Pages workflow disabled. |
| **Overall GTM readiness** | **7.0 / 10** | Stronger for stakeholder/investor demo; paid customer onboarding still gated by provider verification + production hosting + `/api/auth/signup`. |

---

## 3 · Public marketing website

| Page | Status |
|---|---|
| `/` | 🟢 Live · 🌐 Public |
| `/platform` | 🟢 Live · 🌐 Public |
| `/solutions` | 🟢 Live · 🌐 Public |
| `/use-cases` | 🟢 Live · 🌐 Public |
| `/integrations` | 🟢 Live · 🌐 Public |
| `/pricing` | 🟢 Live · 🌐 Public |
| `/security` | 🟢 Live · 🌐 Public |
| `/about` | 🟢 Live · 🌐 Public |
| `/privacy` | 🟢 Live · 🌐 Public |
| `/terms` | 🟢 Live · 🌐 Public |
| `/resources` | 🟠 Preview · 🌐 Public — 6 article cards labelled COMING SOON |
| `/contact` | 🟢 Live · 🌐 Public — POSTs to `/api/contact`, persists to `ContactSubmission` |
| `/demo` | 🟢 Live · 🌐 Public — POSTs to `/api/demo-request`, persists to `DemoRequest` |

**Known divergence from `CLAUDE.md` design rule:** `--sg-anomaly: #7C3AED` in the marketing CSS palette is violet. The rule says "never purple" (Claude.ai's brand colour). It is used as one of five accent tones, not a primary. Replacing it would also touch the dashboard. Out of scope without an explicit redesign request.

---

## 4 · Auth & access control

| Layer | File | Status |
|---|---|---|
| Edge proxy / public allow-list | `proxy.ts` | 🟢 Live, smoke-tested |
| Server layout guard | `app/(dashboard)/layout.tsx` | 🟢 Live |
| Per-route session check | every `app/api/**/route.ts` | 🟢 Live |
| Login / logout endpoints | `app/api/auth/login`, `app/api/auth/logout` | 🟢 Live · 🌐 Public |
| Session cookie | `tl_session` JWT, 7-day expiry, httpOnly + secure + SameSite=Lax | 🟢 Live |
| Signup endpoint | `/signup` page; no `/api/auth/signup` route yet | 🟠 Preview |

Smoke-test result from previous session: 13/13 marketing 200 · 2/2 auth 200 · 26/26 dashboard 307→/login · 45/45 protected APIs 401.

---

## 5 · Dashboard portal

### 5a · Phase 1 (🟢 Live)
`/dashboard`, `/ai-users`, `/ai-users/[userId]`, `/ai-teams`, `/ai-teams/[teamId]`, `/ai-models`, `/ai-models/[modelName]`, `/claude-code`, `/settings`, `/limitations`, `/providers`.

### 5b · Phase 2A multi-provider (🟢 Live UI)
`/developer-ai-tools`, `/developer-ai-tools/{claude-code,cursor,github-copilot}`, `/llm-spend`, `/llm-spend/{claude,openai}`, `/business-productivity-ai`, `/business-productivity-ai/microsoft-copilot`.

### 5c · Phase 2B governance (🔵 Coming Soon)
`/alerts`, `/reports`, `/audit-logs`, `/notifications`. Placeholder UIs; Prisma tables (`Alert`, `AlertRule`, `AuditLog`, `NotificationChannel`, `NotificationDeliveryLog`) exist; delivery flow not wired customer-facing.

### 5d · Phase 3 intelligence (⚪ Planned)
`/roi`, `/suggestions`. Placeholder UIs; Prisma tables (`AiAdoptionScoreDaily`, `AiWasteScoreDaily`, `TeamEfficiencyScoreDaily`, `Recommendation`) exist; scoring engine not implemented.

---

## 6 · API routes (47 total)

| Category | Count | Status |
|---|---|---|
| Auth (login + logout, public) | 2 | 🟢 Live · 🌐 Public |
| Lead capture (contact + demo, public) | 2 | 🟢 Live · 🌐 Public |
| Auth (me, protected) | 1 | 🟢 Live · 🔒 |
| Dashboard | 4 | 🟢 Live · 🔒 |
| Users / Teams / Models | 8 | 🟢 Live · 🔒 |
| Provider Spend by Category | 6 | 🟡 Live for Anthropic / Claude Code; needs verification for others · 🔒 |
| Providers / Sync | 8 | 🟢 Live · 🔒 |
| Settings | 4 | 🟢 Live · 🔒 |
| Phase 2B Governance | 6 | 🔵 Coming Soon · 🔒 |
| Phase 3 Intelligence + ROI | 8 | ⚪ Planned · 🔒 |

Per-endpoint detail: [`URL_INVENTORY.md`](URL_INVENTORY.md).

---

## 7 · Provider integrations

| Provider | UI | Connector | Worker | Production-live |
|---|---|---|---|---|
| Anthropic / Claude | 🟢 | 🟢 | 🟢 | 🟢 **Live** |
| Claude Code | 🟢 | 🟢 (reuses Anthropic) | 🟢 | 🟢 **Live** |
| OpenAI | 🟢 | 🟡 (90 LOC) | 🟡 (155 LOC) | 🟡 **Needs verification** |
| GitHub Copilot | 🟢 | 🟡 (138 LOC) | 🟡 (131 LOC) | 🟡 **Needs verification** |
| Cursor | 🟢 | 🟡 (179 LOC) | 🟡 (119 LOC) | 🟡 **Needs verification** |
| Microsoft 365 Copilot | 🟢 | 🟡 (203 LOC) | 🟡 (138 LOC) | 🟡 **Needs verification** |
| Gemini | 🟢 (limitations page) | 🚫 | 🚫 | 🚫 **Limited** |
| Perplexity | 🟢 (limitations page) | 🚫 | 🚫 | 🚫 **Limited** |

---

## 8 · Forms / lead capture

| Feature | Status | Notes |
|---|---|---|
| `/contact` form | 🟢 **Live (verified against Neon)** | POSTs to `/api/contact`. Zod-validated, rate-limited (5/min/IP), honeypot-protected, persisted to `ContactSubmission`. Stores only `ipHash`. **Email notification wired** via Resend (`lib/email.ts`); outcome tracked on `notificationSentAt` / `notificationError`. **Currently 🟡 Implemented — pending email env configuration** (`RESEND_API_KEY` / `EMAIL_FROM` / `LEAD_NOTIFICATION_EMAIL` not yet set; rows still land, missing-config path verified). |
| `/demo` form | 🟢 **Live (verified against Neon)** | POSTs to `/api/demo-request`. Same protections + email pipeline + tracking columns. Persisted to `DemoRequest` with `preferredTime`, `companySize`. **No calendar integration** — sales team contacts manually based on `preferredTime`. |
| Lead-capture email notifications | 🟡 **Implemented — pending email env configuration** | `lib/email.ts` wired into both endpoints; missing-config path tested (returns success, persists row, logs safe warning, sets `notificationError = "missing_config:..."`). Will go 🟢 Live once `RESEND_API_KEY` + `EMAIL_FROM` + `LEAD_NOTIFICATION_EMAIL` are set in prod env. |
| `/signup` | 🟠 Preview | UI present; no `/api/auth/signup` route. |
| Newsletter | 🚫 Not built | Implicit in `/resources` CTA. |

---

## 9 · Resources / blog

| Item | Status |
|---|---|
| `/resources` page | 🟢 Live |
| 6 article preview cards | 🟠 Preview — labelled COMING SOON |
| MDX/blog collection | 🚫 Not built |
| `/resources/[slug]` route | 🚫 Not built |

---

## 10 · SEO

| Item | Status |
|---|---|
| `<title>` + `description` on all 13 marketing pages | 🟢 Live |
| OpenGraph + Twitter card on `/` | 🟢 Live |
| OpenGraph + Twitter card on `/contact` + `/demo` (via sibling `layout.tsx`) | 🟢 Live |
| Viewport theme-color | 🟢 Live |
| `robots.txt` (via `app/robots.ts`) | 🟢 Live |
| `sitemap.xml` (via `app/sitemap.ts`) | 🟢 Live |
| OG image (Next.js `opengraph-image.tsx` convention, 1200×630, edge runtime) | 🟢 Live — Signal Gallery style. Default at `app/opengraph-image.tsx`; per-page overrides for `/contact` and `/demo`. Shared renderer in `lib/og-render.tsx`. |
| `NEXT_PUBLIC_SITE_URL` / `APP_URL` env var for canonical absolute URLs | 🟡 Recommended in prod (falls back to `https://tokenlens.ai` for prod builds; `http://localhost:3000` in dev) |

---

## 11 · Deployment

| Target | Status | Notes |
|---|---|---|
| Local dev (`npm run dev`) | 🟢 Live | http://localhost:3000 |
| Server build (`npm run build`) | 🟢 Live | Last green build: 55 static pages, 33 dynamic routes, proxy middleware compiled |
| Static export (`NEXT_OUTPUT_MODE=export`) | 🟢 Configured | API routes must be excluded before build |
| GitHub Pages workflow | 🚫 Disabled | `.github/workflows/deploy-pages.yml.disabled` |
| Production host (Vercel/Railway/Render/etc.) | 🚫 Not set up | Required env vars listed in [`ENVIRONMENT.md`](ENVIRONMENT.md) |

---

## 12 · Known gaps (recommended next engineering steps)

| Priority | Item |
|---|---|
| 🔴 High | Validate the 4 non-Anthropic provider connectors against real customer tenants and graduate them from 🟡 to 🟢. |
| 🔴 High | Build `/api/auth/signup` and connect the existing `/signup` page to it. |
| 🔴 High | Wire an email delivery provider (Resend / Postmark / SES) so contact + demo submissions trigger an actual notification. Today they only land in Postgres. |
| 🔴 High | Wire a calendar booking provider (Cal.com / Calendly / Google Calendar) so `/demo` returns a real time slot link instead of relying on sales-team follow-up. |
| 🟡 Medium | Wire Phase 2B delivery channels (Slack, Teams, PagerDuty) end-to-end for the existing `NotificationChannel` schema. |
| 🟡 Medium | Ship MDX/blog collection at `/resources/[slug]`. |
| 🟡 Medium | Add an admin triage UI to view/respond to `ContactSubmission` and `DemoRequest` rows. |
| 🟡 Medium | Set `NEXT_PUBLIC_SITE_URL` in production env so sitemap/robots/OG point at the canonical domain. |
| 🟢 Low | Implement Phase 3 scoring engine using existing `AiAdoptionScoreDaily`, `AiWasteScoreDaily`, `TeamEfficiencyScoreDaily` tables. |
| 🟢 Low | Re-enable GitHub Pages workflow (marketing-only static deploy). |
| 🟢 Low | Address the violet `--sg-anomaly` colour token (out of scope without redesign). |
