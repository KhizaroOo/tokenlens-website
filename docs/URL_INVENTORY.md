# URL_INVENTORY.md

> Complete route inventory, verified by enumerating `app/**/page.tsx` and `app/api/**/route.ts` directly.
> Verified on **2026-05-28**.

---

## Counts at a glance

| Bucket | Count |
|---|---|
| Public marketing pages | **13** |
| Public auth pages (`/login`, `/signup`) | **2** |
| **Public website + auth pages — total** | **15** |
| Authenticated portal pages (unique URLs) | **26** |
| API routes — total | **49** |
| API — public | 4 (`/api/auth/login`, `/api/auth/logout`, `/api/contact`, `/api/demo-request`) |
| API — protected | 45 |
| Special routes | `app/not-found.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx` (+ per-page overrides), `proxy.ts` |

---

## 1 · Public website + auth pages — 15

### 1a · Public marketing pages — 13

| # | URL | Page | Status |
|---|---|---|---|
| 1 | `/` | Homepage | 🟢 Live · 🌐 |
| 2 | `/platform` | Platform Atlas — 12 operating modules | 🟢 Live · 🌐 |
| 3 | `/solutions` | Six personas (CTO / CFO / FinOps / Eng / Platform / IT) | 🟢 Live · 🌐 |
| 4 | `/use-cases` | 12 signal tiles | 🟢 Live · 🌐 |
| 5 | `/integrations` | Provider constellation + status cards | 🟢 Live · 🌐 |
| 6 | `/pricing` | 3 tiers + FAQ | 🟢 Live · 🌐 |
| 7 | `/security` | Security pillars + FAQ | 🟢 Live · 🌐 |
| 8 | `/about` | Manifesto + 6 values | 🟢 Live · 🌐 |
| 9 | `/privacy` | Privacy Policy | 🟢 Live · 🌐 |
| 10 | `/terms` | Terms of Service | 🟢 Live · 🌐 |
| 11 | `/resources` | Library (preview articles) | 🟠 Preview · 🌐 |
| 12 | `/contact` | Contact form → `/api/contact` | 🟢 Live · 🌐 |
| 13 | `/demo` | Demo request form → `/api/demo-request` | 🟢 Live · 🌐 |

### 1b · Public auth pages — 2

| # | URL | Page | Status |
|---|---|---|---|
| 14 | `/login` | Login (reads `?redirect=…`) | 🟢 Live · 🌐 |
| 15 | `/signup` | Signup form (no backend yet) | 🟠 Preview · 🌐 |

### 1c · Marketing anchor links (on `/solutions`)

| URL | Section |
|---|---|
| `/solutions#cto` | CTO persona |
| `/solutions#cfo` | CFO persona |
| `/solutions#finops` | FinOps persona |
| `/solutions#engineering` | Engineering Leaders persona |
| `/solutions#platform` | AI Platform Teams persona |
| `/solutions#it` | IT / Governance persona |

---

## 2 · Authenticated portal — 26 unique URLs

> All gated by `proxy.ts` + `app/(dashboard)/layout.tsx`. Unauthenticated requests → `307 → /login?redirect=…`. Each is 🔒.

### 2a · Phase 1 (🟢 Live) — 11 URLs

| # | URL |
|---|---|
| 1 | `/dashboard` |
| 2 | `/ai-users` |
| 3 | `/ai-users/[userId]` |
| 4 | `/ai-teams` |
| 5 | `/ai-teams/[teamId]` |
| 6 | `/ai-models` |
| 7 | `/ai-models/[modelName]` |
| 8 | `/claude-code` |
| 9 | `/limitations` |
| 10 | `/providers` |
| 11 | `/settings` |

### 2b · Phase 2A multi-provider (🟢 UI Live) — 9 URLs

| # | URL |
|---|---|
| 12 | `/developer-ai-tools` |
| 13 | `/developer-ai-tools/claude-code` |
| 14 | `/developer-ai-tools/cursor` |
| 15 | `/developer-ai-tools/github-copilot` |
| 16 | `/llm-spend` |
| 17 | `/llm-spend/claude` |
| 18 | `/llm-spend/openai` |
| 19 | `/business-productivity-ai` |
| 20 | `/business-productivity-ai/microsoft-copilot` |

### 2c · Phase 2B governance (🔵 Coming Soon) — 4 URLs

| # | URL |
|---|---|
| 21 | `/alerts` |
| 22 | `/audit-logs` |
| 23 | `/notifications` |
| 24 | `/reports` |

### 2d · Phase 3 intelligence (⚪ Planned) — 2 URLs

| # | URL |
|---|---|
| 25 | `/roi` |
| 26 | `/suggestions` |

---

## 3 · API routes — 49

> 4 public + 45 protected.

### 3a · Auth API — 3 (2 public + 1 protected)

| URL | Method | Status |
|---|---|---|
| `/api/auth/login` | POST | 🟢 Live · 🌐 |
| `/api/auth/logout` | POST | 🟢 Live · 🌐 |
| `/api/auth/me` | GET | 🟢 Live · 🔒 |

### 3a-bis · Public lead-capture API — 2 (both public · POST only)

| URL | Method | Status | Notes |
|---|---|---|---|
| `/api/contact` | POST | 🟢 Live · 🌐 | zod-validated, rate-limit 5/min/IP, persists to `ContactSubmission` |
| `/api/demo-request` | POST | 🟢 Live · 🌐 | zod-validated, rate-limit 5/min/IP, persists to `DemoRequest` |

Both endpoints return 405 for GET/PUT/PATCH/DELETE.

### 3b · Dashboard API — 4 (all 🟢 Live · 🔒)

- `/api/dashboard`
- `/api/dashboard/overview`
- `/api/dashboard/top-models`
- `/api/dashboard/trends`

### 3c · Users / Teams / Models — 8 (all 🟢 Live · 🔒)

- `/api/users`
- `/api/users/[userId]/details`
- `/api/users/[userId]/ai-health`
- `/api/teams`
- `/api/teams/[teamId]/details`
- `/api/teams/[teamId]/members`
- `/api/models`
- `/api/models/[modelName]/details`

### 3d · Provider Spend by Category — 6 (🔒)

| URL | Status |
|---|---|
| `/api/llm-spend` | 🟢 Live |
| `/api/llm-spend/[provider]` | 🟡 Live for `claude` / `openai`; verification pending for others |
| `/api/developer-ai-tools` | 🟢 Live |
| `/api/developer-ai-tools/[provider]` | 🟡 Live for `claude-code`; verification pending for others |
| `/api/business-productivity-ai` | 🟡 Verification pending |
| `/api/claude-code` | 🟢 Live |

### 3e · Providers / Sync — 8 (all 🟢 Live · 🔒)

- `/api/providers`
- `/api/providers/[providerKey]`
- `/api/providers/[providerKey]/sync`
- `/api/providers/sync-runs`
- `/api/provider` *(legacy singular)*
- `/api/provider/sync` *(legacy)*
- `/api/provider/sync-all` *(legacy)*
- `/api/provider/sync-code` *(legacy)*

### 3f · Settings — 4 (all 🟢 Live · 🔒)

- `/api/settings`
- `/api/settings/organization`
- `/api/settings/budget`
- `/api/settings/alert-rules`

### 3g · Governance — Phase 2B — 6 (all 🔵 Coming Soon · 🔒)

- `/api/alerts`
- `/api/audit-logs`
- `/api/notifications/channels`
- `/api/notifications/test`
- `/api/reports`
- `/api/data-retention`

### 3h · Intelligence + ROI — Phase 3 — 8 (all ⚪ Planned · 🔒)

- `/api/intelligence/adoption-scores`
- `/api/intelligence/team-efficiency`
- `/api/intelligence/waste-scores`
- `/api/recommendations`
- `/api/recommendations/[id]`
- `/api/roi/overview`
- `/api/roi/by-team`
- `/api/roi/trends`

**Arithmetic check:** `3 (auth) + 2 (lead capture) + 4 (dashboard) + 8 (users/teams/models) + 6 (provider spend) + 8 (providers/sync) + 4 (settings) + 6 (Phase 2B) + 8 (Phase 3) = 49` ✓

---

## 4 · Special / framework routes

| URL | Purpose | Status |
|---|---|---|
| `app/not-found.tsx` (served on any unmatched URL) | 404 page | 🟢 Live · 🌐 |
| `app/robots.ts` → `/robots.txt` | Crawl rules — allows public routes, disallows `/api/*` and all dashboard routes | 🟢 Live · 🌐 |
| `app/sitemap.ts` → `/sitemap.xml` | 15 public URLs (13 marketing + 2 auth) with lastmod / changefreq / priority | 🟢 Live · 🌐 |
| `app/opengraph-image.tsx` → `/opengraph-image` (+ per-page overrides under `/contact` and `/demo`) | Dynamic 1200×630 OpenGraph image (edge runtime, `ImageResponse`). Next.js file convention auto-wires `<meta property="og:image">` and Twitter card. Shared renderer in `lib/og-render.tsx`. | 🟢 Live · 🌐 |
| `proxy.ts` (`config.matcher`) | Edge auth gate — runs on every matched request | 🟢 Live |

---

## 5 · Auth boundary summary

```
┌─ PUBLIC (no tl_session cookie needed) ─────────────────────────
│  13 marketing pages: /, /about, /platform, /solutions, /use-cases,
│                       /integrations, /pricing, /security, /resources,
│                       /contact, /demo, /privacy, /terms
│  2  auth pages:       /login, /signup
│  2  auth APIs:        /api/auth/login, /api/auth/logout
│  2  lead-capture APIs: /api/contact, /api/demo-request
│  +  framework routes: /robots.txt, /sitemap.xml, /opengraph-image (+ per-page overrides)
│  +  static assets:    /_next/*, /favicon.ico, images
│
├─ PROTECTED (tl_session JWT required) ──────────────────────────
│  26 dashboard pages       → 307 → /login?redirect=...
│  45 protected API routes  → 401 JSON
└────────────────────────────────────────────────────────────────
```

---

## 6 · Why `next build` route counts may differ

`next build` reports a different total than this inventory. Both are correct in their own frame:

| Reason | Effect |
|---|---|
| `next build` collapses dynamic patterns into one row (`/ai-users/[userId]` = 1) — same as this inventory | No mismatch on dynamic pages |
| `next build` shows `app/not-found.tsx` as one row but it serves every unmatched URL | This inventory shows it once |
| `next build` reports the proxy as `ƒ Proxy (Middleware)`, not as a URL | This inventory shows it under §4 |
| Internal Next routes (`/_next/static/*`, `/_next/image`, RSC streams) are framework-managed | Excluded from this inventory |
| Static (`○`) vs dynamic (`ƒ`) is a rendering classification, not a URL count | A `ƒ` route still has exactly one URL |

For deployment / QA / GTM planning, **use this inventory**. For static-export sizing, read the `next build` output.
