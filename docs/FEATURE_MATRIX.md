# FEATURE_MATRIX.md

> Per-feature status across the marketing site, auth, dashboard, governance, and infrastructure.
> Verified against the repo on **2026-05-28**.

## Status labels

🟢 Live · 🟡 Implemented — needs verification · 🟠 Preview · 🔵 Coming Soon · ⚪ Planned · 🚫 Not built / Limited

User-facing claim allowed?
- **Yes** — safe for stakeholder/investor demo + customer pitch.
- **Soft** — OK to mention with appropriate caveat ("Coming Soon", "Preview", "implementation present; production validation pending").
- **No** — do not claim publicly under any form.

---

## 1 · Marketing website

| Feature | Route / Page | API endpoint | Status | Public claim? | Notes |
|---|---|---|---|---|---|
| Homepage | `/` | — | 🟢 Live | Yes | Hero, chaos wall, modules, dashboard screenshot, persona views, alert stack |
| Platform Atlas | `/platform` | — | 🟢 Live | Yes | 12 modules detailed |
| Solutions / Personas | `/solutions` | — | 🟢 Live | Yes | 6 persona cards with anchor IDs |
| Use Cases | `/use-cases` | — | 🟢 Live | Yes | 12 signal tiles |
| Integrations | `/integrations` | — | 🟢 Live | Yes | Provider status cards with honest "available / in-progress / limited" labels |
| Pricing | `/pricing` | — | 🟢 Live | Yes | Custom pricing — "talk to sales" |
| Security | `/security` | — | 🟢 Live | Yes | Pillars + FAQ; honest about SOC 2 status |
| Resources | `/resources` | — | 🟠 Preview | Soft (with COMING SOON label) | 6 article previews; no MDX/blog collection yet |
| About | `/about` | — | 🟢 Live | Yes | Manifesto + 6 product values |
| Contact form | `/contact` | `/api/contact` (POST) | 🟢 Live (verified) | Yes | Zod-validated, rate-limited 5/min/IP, honeypot `website`, persisted to `ContactSubmission` on **Neon**. Stores `ipHash` only. Email notifier wired via Resend (`lib/email.ts`); outcome tracked in `notificationSentAt` / `notificationError`. **Email-send itself: 🟡 Implemented — pending env config.** |
| Demo form | `/demo` | `/api/demo-request` (POST) | 🟢 Live (verified) | Yes | Same protections + `preferredTime` + `companySize` + email pipeline. Calendar booking not wired. |
| Lead-capture email notification | `/api/contact`, `/api/demo-request` | (via `lib/email.ts` / Resend) | 🟡 Implemented — needs env config | Soft — "Implementation present; email delivery pending env configuration" | Code in repo, missing-config path tested (succeeds + flags `notificationError`). Goes 🟢 once `RESEND_API_KEY`, `EMAIL_FROM`, `LEAD_NOTIFICATION_EMAIL` are set. |
| Privacy Policy | `/privacy` | — | 🟢 Live | Yes | 7 sections |
| Terms of Service | `/terms` | — | 🟢 Live | Yes | 7 sections |
| Signal Gallery theme | `app/(marketing)/layout.tsx` + `globals.css` | — | 🟢 Live | Yes | Editorial museum aesthetic, light + dark mode |
| Real dashboard screenshots | `public/screenshots/dashboard-{light,dark}.png` | — | 🟢 Live | Yes | Used by `DashboardMockup` component |

---

## 2 · Auth & access control

| Feature | Route / Page | API endpoint | Status | Public claim? | Notes |
|---|---|---|---|---|---|
| Login | `/login` | `/api/auth/login` (POST) | 🟢 Live | Yes | JWT in `tl_session` cookie |
| Logout | — | `/api/auth/logout` (POST) | 🟢 Live | Yes | Clears cookie |
| Session check | — | `/api/auth/me` (GET) | 🟢 Live | Yes | Returns session payload |
| Signup page | `/signup` | none yet | 🟠 Preview | Soft | UI exists; no `/api/auth/signup` endpoint |
| Edge proxy gate | `proxy.ts` | — | 🟢 Live | Yes | Public allow-list + 307/401 enforcement |
| Server layout guard | `app/(dashboard)/layout.tsx` | — | 🟢 Live | Yes | Defence-in-depth |
| Per-route session check | every `/api/**/route.ts` | — | 🟢 Live | Yes | `requireSession()` + `organizationId` scoping |
| Encrypted provider credentials | `lib/encryption.ts` (AES-256-GCM) | — | 🟢 Live | Yes | Keys never leave server |
| SOC 2 / ISO 27001 | — | — | 🚫 | **No** | Not held |

---

## 3 · Dashboard (top-level overview)

| Feature | Route | API endpoint | Status | Public claim? | Notes |
|---|---|---|---|---|---|
| Main dashboard | `/dashboard` | `/api/dashboard`, `/api/dashboard/overview`, `/api/dashboard/top-models`, `/api/dashboard/trends` | 🟢 Live | Yes | Provider cards, 30-day cost, trends |

---

## 4 · AI Users / Teams / Models

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| AI Users list | `/ai-users` | `/api/users` | 🟢 Live | Yes |
| AI User detail | `/ai-users/[userId]` | `/api/users/[userId]/details`, `/api/users/[userId]/ai-health` | 🟢 Live | Yes |
| AI Teams list | `/ai-teams` | `/api/teams` | 🟢 Live | Yes |
| AI Team detail | `/ai-teams/[teamId]` | `/api/teams/[teamId]/details`, `/api/teams/[teamId]/members` | 🟢 Live | Yes |
| AI Models list | `/ai-models` | `/api/models` | 🟢 Live | Yes |
| AI Model detail | `/ai-models/[modelName]` | `/api/models/[modelName]/details` | 🟢 Live | Yes |

---

## 5 · Providers / Sync

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| Providers list | `/providers` | `/api/providers` | 🟢 Live | Yes |
| Provider settings | `/settings` | `/api/providers/[providerKey]` | 🟢 Live | Yes |
| Trigger single sync | — | `/api/providers/[providerKey]/sync` | 🟢 Live | Yes |
| Sync run history | — | `/api/providers/sync-runs` | 🟢 Live | Yes |
| Trigger all syncs | — | `/api/provider/sync-all` (legacy) | 🟢 Live | Yes |
| Provider limitations exhibit | `/limitations` | — | 🟢 Live | Yes |

---

## 6 · Developer AI Tools

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| Overview | `/developer-ai-tools` | `/api/developer-ai-tools` | 🟢 Live | Yes |
| Claude Code | `/developer-ai-tools/claude-code` | `/api/developer-ai-tools/claude-code`, `/api/claude-code` | 🟢 Live | Yes |
| GitHub Copilot | `/developer-ai-tools/github-copilot` | `/api/developer-ai-tools/github-copilot` | 🟡 | Soft — "implementation present; production validation pending" |
| Cursor | `/developer-ai-tools/cursor` | `/api/developer-ai-tools/cursor` | 🟡 | Soft |

---

## 7 · LLM / API Spend

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| Overview | `/llm-spend` | `/api/llm-spend` | 🟢 Live | Yes |
| Claude / Anthropic | `/llm-spend/claude` | `/api/llm-spend/claude` | 🟢 Live | Yes |
| OpenAI | `/llm-spend/openai` | `/api/llm-spend/openai` | 🟡 | Soft |
| Gemini | (no dedicated page — see `/limitations`) | — | 🚫 Limited | Soft — "no aggregate admin API" |
| Perplexity | (no dedicated page — see `/limitations`) | — | 🚫 Limited | Soft |

---

## 8 · Business Productivity AI

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| Overview | `/business-productivity-ai` | `/api/business-productivity-ai` | 🟡 | Soft |
| Microsoft 365 Copilot | `/business-productivity-ai/microsoft-copilot` | (uses overview endpoint) | 🟡 | Soft |

---

## 9 · Governance — Phase 2B

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| Alerts page | `/alerts` | `/api/alerts` | 🔵 Coming Soon | Soft — "Coming Soon" only |
| Alert rules | `/settings` → alert rules tab | `/api/settings/alert-rules` | 🟡 | Soft — schema exists |
| Reports page | `/reports` | `/api/reports` | 🔵 Coming Soon | Soft |
| Audit logs page | `/audit-logs` | `/api/audit-logs` | 🔵 Coming Soon | Soft — `AuditLog` table exists |
| Notifications page | `/notifications` | `/api/notifications/channels`, `/api/notifications/test` | 🔵 Coming Soon | Soft |
| Slack / Teams / PagerDuty delivery | — | — | 🚫 Not wired | **No** — do not claim shipped |
| Email delivery | — | — | 🚫 Not wired | **No** |
| Data retention policy | — | `/api/data-retention` | 🟡 | Soft — schema exists |

---

## 10 · ROI / Suggestions — Phase 3

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| AI ROI dashboard | `/roi` | `/api/roi/overview`, `/api/roi/by-team`, `/api/roi/trends` | ⚪ Planned | Soft — "Planned" only |
| Suggestions / recommendations | `/suggestions` | `/api/recommendations`, `/api/recommendations/[id]` | ⚪ Planned | Soft |
| Adoption scoring | — | `/api/intelligence/adoption-scores` | ⚪ Planned | Soft |
| Team efficiency scoring | — | `/api/intelligence/team-efficiency` | ⚪ Planned | Soft |
| Waste scoring | — | `/api/intelligence/waste-scores` | ⚪ Planned | Soft |
| Board-ready PDF reports | — | — | 🚫 Not built | **No** |
| One-click reclaim workflow | — | — | 🚫 Not built | **No** |

---

## 11 · Settings

| Feature | Route | API endpoint | Status | Public claim? |
|---|---|---|---|---|
| General settings | `/settings` | `/api/settings`, `/api/settings/organization` | 🟢 Live | Yes |
| Budget config | `/settings` → budget tab | `/api/settings/budget` | 🟢 Live | Yes |
| Alert rule config | `/settings` → alert rules tab | `/api/settings/alert-rules` | 🟡 | Soft |
| Provider credential entry | `/settings` → provider tab | `/api/providers/[providerKey]` | 🟢 Live | Yes |
| Role-based access (viewer / admin / owner) | enforced at API layer | — | 🟢 Live | Yes |

---

## 12 · Resources / blog

| Feature | Route | Status | Public claim? |
|---|---|---|---|
| Resources index | `/resources` | 🟠 Preview | Soft — COMING SOON labelled |
| Article cards (6) | `/resources` | 🟠 Preview | **No** — do not claim as published content |
| MDX article collection | `/resources/[slug]` | 🚫 Not built | — |
| Newsletter subscription | (CTA only) | 🚫 Not built | — |

---

## 13 · SEO / metadata

| Feature | Status | Public claim? | Notes |
|---|---|---|---|
| `<title>` + `description` on all 13 pages | 🟢 Live | Yes | |
| OpenGraph + Twitter card on `/` | 🟢 Live | Yes | |
| Server `layout.tsx` metadata for `/contact` + `/demo` | 🟢 Live | Yes | Required because pages are `"use client"` |
| Viewport theme-color | 🟢 Live | Yes | Per-page |
| `/robots.txt` via `app/robots.ts` | 🟢 Live | Yes | Allows public routes, disallows `/api/*` and all dashboard routes |
| `/sitemap.xml` via `app/sitemap.ts` | 🟢 Live | Yes | 15 public URLs with lastmod / changefreq / priority |
| OG image via `opengraph-image.tsx` convention | 🟢 Live | Yes | 1200×630, edge runtime, Signal Gallery dark mode. Default at `app/opengraph-image.tsx`; per-page overrides for `/contact` + `/demo`. Shared renderer in `lib/og-render.tsx`. |
| `NEXT_PUBLIC_SITE_URL` / `APP_URL` env for canonical URLs | 🟡 Recommended in prod | Yes | Resolution: explicit env → `NEXT_PUBLIC_VERCEL_URL` → `http://localhost:3000` (dev) → `https://tokenlens.ai` (prod placeholder) |

---

## 14 · Deployment

| Feature | Status | Public claim? | Notes |
|---|---|---|---|
| Server build (`npm run build`) | 🟢 Live | Yes | |
| Static export config | 🟢 Configured | Yes | `NEXT_OUTPUT_MODE=export` |
| GitHub Pages workflow | 🚫 Disabled | — | `.github/workflows/deploy-pages.yml.disabled` |
| Vercel / Railway / Render production host | 🚫 Not set up | — | See [`DEPLOYMENT.md`](DEPLOYMENT.md) |
| CI tests | 🚫 Not set up | — | |
