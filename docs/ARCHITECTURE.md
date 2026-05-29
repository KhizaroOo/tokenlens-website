# TokenLens — Application Architecture

> Generated: 2026-05-29. Reflects the state after Phase 2A UI completion + lead-capture + email notifier implementation.

---

## 1 · System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER / CLIENT                               │
│                                                                             │
│   Public Marketing Site          │         Authenticated Portal             │
│   (Signal Gallery theme)         │         (Dashboard layout)               │
│   13 pages — no auth required    │         26 pages — tl_session cookie     │
└──────────────────┬───────────────┴──────────────────────┬───────────────────┘
                   │  HTTP request                        │  HTTP request
                   ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         proxy.ts  (Next.js 16 edge gate)                    │
│                                                                             │
│  PUBLIC allow-list:                  │  Everything else:                    │
│  / /platform /solutions /use-cases   │  Page request → 307 → /login         │
│  /integrations /pricing /security    │  API request  → 401 JSON             │
│  /resources /about /contact /demo    │                                      │
│  /privacy /terms /login /signup      │                                      │
│  /api/auth/login /api/auth/logout    │                                      │
│  /api/contact /api/demo-request      │                                      │
│  Static assets + OG images           │                                      │
└──────────────────┬───────────────────┴──────────────────┬───────────────────┘
                   │                                      │
          ┌────────▼────────┐                   ┌─────────▼──────────┐
          │  Marketing +    │                   │  Dashboard Layout  │
          │  Auth pages     │                   │  layout.tsx        │
          │  (no guard)     │                   │  (server guard #2) │
          └────────┬────────┘                   └─────────┬──────────┘
                   │                                      │ getSession() →
                   │                                      │ redirect if null
                   │                                      ▼
                   │                            ┌──────────────────────┐
                   │                            │  Dashboard Pages     │
                   │                            │  /dashboard          │
                   │                            │  /ai-users/**        │
                   │                            │  /ai-teams/**        │
                   │                            │  /ai-models/**       │
                   │                            │  /llm-spend/**       │
                   │                            │  /developer-ai-tools/│
                   │                            │  /business-productivity-ai/
                   │                            │  /providers          │
                   │                            │  /settings           │
                   │                            │  /alerts (placeholder)
                   │                            │  /reports (placeholder)
                   │                            │  /audit-logs (placeholder)
                   │                            │  /notifications (placeholder)
                   │                            │  /roi (placeholder)  │
                   │                            │  /suggestions (placeholder)
                   └────────────────────────────┴──────────────────────┘
```

---

## 2 · Three-Layer Auth Model

```
Request arrives
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Layer 1: proxy.ts (Edge — runs before any render)  │
│                                                     │
│  Reads tl_session cookie → jwt.verify()             │
│  ✓ valid  → pass through                           │
│  ✗ missing/invalid + page → 307 /login?redirect=…  │
│  ✗ missing/invalid + API  → 401 { error: "…" }     │
└───────────────────────────┬─────────────────────────┘
                            │ (only reaches here if Layer 1 passed)
                            ▼
┌─────────────────────────────────────────────────────┐
│  Layer 2: app/(dashboard)/layout.tsx (Server comp.) │
│                                                     │
│  Calls getSession() → redirect if null              │
│  Defence-in-depth. Catches edge cases where         │
│  proxy.ts was bypassed (e.g., direct SSR render).   │
└───────────────────────────┬─────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│  Layer 3: each app/api/**/route.ts handler          │
│                                                     │
│  const session = await requireSession(req)          │
│  ↳ throws 401 if invalid                           │
│  All DB queries: WHERE organizationId = session.org │
│  Source of truth for data isolation.                │
└─────────────────────────────────────────────────────┘

Cookie spec:
  Name:     tl_session
  Algorithm: HS256  (jsonwebtoken)
  Secret:   JWT_SECRET env var
  MaxAge:   7 days
  Flags:    httpOnly · Secure (prod) · SameSite=Lax
  Payload:  { userId, organizationId, email, role, iat, exp }
```

---

## 3 · Directory Structure

```
tokenlens/
│
├── proxy.ts                    ← Next.js 16 edge gate (replaces middleware.ts)
├── next.config.ts              ← Build config, static-export switch, security headers
├── prisma/
│   ├── schema.prisma           ← 30 Prisma models (see §7)
│   ├── migrations/             ← Migration history
│   └── seed.ts                 ← Demo data (admin@tokenlens.ai / admin123)
│
├── app/
│   ├── layout.tsx              ← Root layout — metadataBase, fonts, providers
│   ├── not-found.tsx           ← Global 404
│   ├── robots.ts               ← /robots.txt (disallows /api/, /dashboard, etc.)
│   ├── sitemap.ts              ← /sitemap.xml (15 public URLs)
│   ├── opengraph-image.tsx     ← Default OG image (1200×630, edge runtime)
│   │
│   ├── (marketing)/            ← 13 public marketing pages, Signal Gallery theme
│   │   ├── layout.tsx          ← Marketing shell (Header + Footer)
│   │   ├── page.tsx            ← / (homepage)
│   │   ├── platform/page.tsx
│   │   ├── solutions/page.tsx
│   │   ├── use-cases/page.tsx
│   │   ├── integrations/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── security/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── contact/
│   │   │   ├── page.tsx        ← Contact form → POST /api/contact
│   │   │   └── opengraph-image.tsx
│   │   └── demo/
│   │       ├── page.tsx        ← Demo form → POST /api/demo-request
│   │       └── opengraph-image.tsx
│   │
│   ├── (auth)/                 ← /login + /signup (public, no layout guard)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx     ← UI only — no /api/auth/signup yet
│   │
│   ├── (dashboard)/            ← 26 protected pages — sidebar layout
│   │   ├── layout.tsx          ← Server guard + AppSidebar + AppTopbar
│   │   ├── dashboard/page.tsx
│   │   ├── ai-users/[userId]/page.tsx
│   │   ├── ai-teams/[teamId]/page.tsx
│   │   ├── ai-models/[modelName]/page.tsx
│   │   ├── llm-spend/{claude,openai}/page.tsx
│   │   ├── developer-ai-tools/{claude-code,github-copilot,cursor}/page.tsx
│   │   ├── business-productivity-ai/microsoft-copilot/page.tsx
│   │   ├── providers/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── limitations/page.tsx
│   │   ├── alerts/page.tsx            ← 🔵 placeholder
│   │   ├── reports/page.tsx           ← 🔵 placeholder
│   │   ├── audit-logs/page.tsx        ← 🔵 placeholder
│   │   ├── notifications/page.tsx     ← 🔵 placeholder
│   │   ├── roi/page.tsx               ← ⚪ placeholder
│   │   └── suggestions/page.tsx       ← ⚪ placeholder
│   │
│   └── api/                    ← 49 API routes
│       ├── auth/{login,logout,me}/route.ts
│       ├── contact/route.ts        ← 🌐 Public lead capture
│       ├── demo-request/route.ts   ← 🌐 Public lead capture
│       ├── dashboard/route.ts
│       ├── users/[userId]/**
│       ├── teams/[teamId]/**
│       ├── models/[modelName]/**
│       ├── providers/**
│       ├── llm-spend/**
│       ├── developer-ai-tools/**
│       ├── business-productivity-ai/**
│       ├── settings/**
│       ├── alerts/ notifications/ reports/ audit-logs/  ← 🔵 Coming Soon
│       ├── roi/ recommendations/ intelligence/           ← ⚪ Planned
│       └── provider/sync-all/
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx      ← Nav groups, status badges (SOON / LIMITED)
│   │   └── AppTopbar.tsx
│   ├── marketing/              ← Signal Gallery UI components
│   │   ├── LensHeroVisual.tsx  ← Hero provider ring + KPI cards
│   │   ├── ProviderConstellation.tsx ← Integrations page 3-ring diagram
│   │   ├── DashboardMockup.tsx ← Theme-aware screenshot display
│   │   └── … (40+ marketing components)
│   └── ui/                     ← shadcn/ui + Base UI primitives
│
├── lib/
│   ├── auth.ts                 ← requireSession(), getSession(), createSession()
│   ├── prisma.ts               ← Prisma client singleton
│   ├── encryption.ts           ← AES-256-GCM for provider credentials
│   ├── rate-limit.ts           ← In-memory rate limiter
│   ├── email.ts                ← Resend safe-fallback wrapper
│   ├── ip-hash.ts              ← SHA-256(IP + secret) → hex
│   ├── site.ts                 ← Canonical URL resolution
│   ├── og-render.tsx           ← Shared OG image renderer (edge)
│   └── table-styles.ts         ← TH/TR/TD helpers + CHART_COLORS
│
├── modules/providers/
│   ├── registry.ts             ← 8-provider registry, categories
│   ├── capabilities.ts         ← hasRealConnector() — true for Anthropic only
│   └── {anthropic,openai,github_copilot,cursor,microsoft_copilot}/
│       ├── connector.ts        ← API call + response parsing
│       └── mapper.ts           ← Maps provider data → Prisma schema
│
├── workers/                    ← Sync workers (called on demand or via cron)
│   ├── sync-claude-usage.worker.ts    (225 LOC — 🟢 live)
│   ├── sync-claude-code.worker.ts     (115 LOC — 🟢 live)
│   ├── sync-openai.worker.ts          (155 LOC — 🟡 needs verification)
│   ├── sync-github-copilot.worker.ts  (131 LOC — 🟡 needs verification)
│   ├── sync-cursor.worker.ts          (119 LOC — 🟡 needs verification)
│   └── sync-microsoft-copilot.worker.ts (138 LOC — 🟡 needs verification)
│
└── scripts/
    ├── validate-provider-integrations.ts
    └── verify-lead-capture.ts
```

---

## 4 · Request Flow — Dashboard Data

```
Browser                   Next.js Server              Neon PostgreSQL
   │                           │                            │
   │── GET /dashboard ─────────►                            │
   │                     proxy.ts:                          │
   │                     read tl_session cookie             │
   │                     jwt.verify(token, JWT_SECRET)      │
   │                     ✓ valid → pass                     │
   │                           │                            │
   │                     layout.tsx:                        │
   │                     getSession() → hydrate             │
   │                           │                            │
   │                     page.tsx rendered                  │
   │◄── HTML + JS ─────────────│                            │
   │                           │                            │
   │── GET /api/dashboard ─────►                            │
   │                     requireSession(req)                │
   │                     ✓ valid, org = "org_abc"           │
   │                           │── SELECT … WHERE           │
   │                           │   organizationId =         │
   │                           │   'org_abc' ───────────────►
   │                           │◄── rows ───────────────────│
   │◄── 200 JSON ──────────────│                            │
```

---

## 5 · Request Flow — Lead Capture (Contact / Demo)

```
Browser                   Next.js                  Neon               Resend
   │                         │                       │                   │
   │── POST /api/contact ────►│                       │                   │
   │   { name, workEmail,    │                       │                   │
   │     message, … }        │                       │                   │
   │                    ┌────▼────────────────────┐  │                   │
   │                    │ 1. Zod validation        │  │                   │
   │                    │ 2. Rate-limit check      │  │                   │
   │                    │    5 req/min/IP          │  │                   │
   │                    │ 3. Honeypot check        │  │                   │
   │                    │    website field filled? │  │                   │
   │                    │    → silent 200, no write│  │                   │
   │                    │ 4. Hash IP               │  │                   │
   │                    │    SHA-256(IP+secret)    │  │                   │
   │                    │ 5. prisma.create(…)      │──►                   │
   │                    │                         │◄──row created         │
   │                    │ 6. void notifyContact(…)│  │                   │
   │◄── 200 { ok: true } │   (fire-and-forget)    │  │                   │
   │                    └────┬────────────────────┘  │                   │
   │                         │ (async, does not      │                   │
   │                         │  block response)      │                   │
   │                         ▼                       │                   │
   │                    lib/email.ts:                │                   │
   │                    check RESEND_API_KEY          │                   │
   │                    ✓ set  → resend.emails.send ──────────────────────►
   │                    ✗ unset → log warning         │                   │
   │                         │                       │                   │
   │                    prisma.update(row, {         │                   │
   │                      notificationSentAt: now    │                   │
   │                      OR notificationError: …    │                   │
   │                    }) ─────────────────────────►│                   │
```

---

## 6 · Provider Sync Flow

```
Admin UI (Settings page)                    Neon DB
        │                                      │
        │── POST /api/providers/:key/sync ─────►
        │                                requireSession()
        │                                decrypt ProviderConnection.encryptedCredentials
        │                                      │
        │                         ┌────────────▼─────────────────┐
        │                         │  workers/sync-*.worker.ts    │
        │                         │                              │
        │                         │  connector.fetchUsage(creds) │
        │                         │        │                     │
        │                         │        ▼                     │
        │                         │  Provider API               │
        │                         │  (Anthropic / OpenAI / etc.) │
        │                         │        │                     │
        │                         │  mapper.toSchema(raw)        │
        │                         │        │                     │
        │                         │  prisma.upsert(              │
        │                         │    AiUsageDaily /            │
        │                         │    DeveloperAiDaily /        │
        │                         │    SeatUsageDaily /          │
        │                         │    BusinessAiDaily           │
        │                         │  )                           │
        │                         │        │                     │
        │                         │  prisma.create(SyncRun)      │
        │                         │  status: success | error     │
        │                         └────────────────────────────-─┘
        │
        │◄── 200 { syncRunId, status }

Credentials are:
  • Entered via Settings UI → encrypted via lib/encryption.ts (AES-256-GCM)
  • Stored in ProviderConnection.encryptedCredentials
  • Decrypted only inside sync workers with ENCRYPTION_KEY env var
  • Never stored in env vars or plaintext
```

---

## 7 · Database Schema Map (30 tables)

```
┌─────────────────────── PHASE 1 — CORE ────────────────────────┐
│                                                                │
│  Organization ──┬── User (bcrypt password)                    │
│                 ├── ProviderConnection (encryptedCredentials)  │
│                 ├── AiUsageDaily     ← LLM/API spend          │
│                 ├── DeveloperAiDaily ← Claude Code, Copilot…  │
│                 ├── SeatUsageDaily   ← seat counts            │
│                 ├── BusinessAiDaily  ← M365 Copilot           │
│                 ├── AiUser           ← per-developer record   │
│                 ├── AiTeam           ← team aggregation       │
│                 ├── AiModel          ← model catalogue        │
│                 └── SyncRun          ← sync history log       │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────── PHASE 2 — GOVERNANCE ──────────────────┐
│                                                                │
│  Alert ── AlertRule                                            │
│  AuditLog                                                      │
│  NotificationChannel ── NotificationDeliveryLog               │
│  BudgetConfig                                                  │
│  DataRetentionPolicy                                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────── PHASE 3 — INTELLIGENCE ────────────────┐
│                                                                │
│  AiAdoptionScoreDaily                                          │
│  AiWasteScoreDaily                                             │
│  TeamEfficiencyScoreDaily                                      │
│  Recommendation                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────── LEAD CAPTURE (PUBLIC) ─────────────────┐
│                                                                │
│  ContactSubmission  (name, workEmail, company, message,        │
│                      ipHash, honeypot-filtered,                │
│                      notificationSentAt, notificationError)    │
│  DemoRequest        (same + preferredTime, companySize)        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 8 · API Route Map (49 routes)

```
PUBLIC (no auth required)
─────────────────────────
POST  /api/auth/login          → issue tl_session cookie
POST  /api/auth/logout         → clear cookie
POST  /api/contact             → lead capture (Zod + rate-limit + honeypot + Prisma)
POST  /api/demo-request        → lead capture (same pattern + preferredTime)

PROTECTED — Auth & Session
───────────────────────────
GET   /api/auth/me             → current session payload

PROTECTED — Dashboard
──────────────────────
GET   /api/dashboard           → summary cards
GET   /api/dashboard/overview  → 30-day cost trend
GET   /api/dashboard/top-models
GET   /api/dashboard/trends

PROTECTED — Users / Teams / Models
────────────────────────────────────
GET   /api/users
GET   /api/users/[userId]/details
GET   /api/users/[userId]/ai-health
GET   /api/teams
GET   /api/teams/[teamId]/details
GET   /api/teams/[teamId]/members
GET   /api/models
GET   /api/models/[modelName]/details

PROTECTED — Provider Spend by Category
────────────────────────────────────────
GET   /api/llm-spend                      → all LLM providers
GET   /api/llm-spend/claude               → Anthropic 🟢 live
GET   /api/llm-spend/openai               → OpenAI 🟡 needs verification
GET   /api/developer-ai-tools             → all dev tools
GET   /api/developer-ai-tools/claude-code → Claude Code 🟢 live
GET   /api/developer-ai-tools/github-copilot 🟡
GET   /api/developer-ai-tools/cursor         🟡
GET   /api/claude-code                    → (legacy endpoint)
GET   /api/business-productivity-ai       → M365 Copilot 🟡

PROTECTED — Providers / Sync
──────────────────────────────
GET   /api/providers
GET   /api/providers/[providerKey]
PUT   /api/providers/[providerKey]        → save credentials
DELETE /api/providers/[providerKey]
POST  /api/providers/[providerKey]/sync   → trigger sync
GET   /api/providers/sync-runs
POST  /api/provider/sync-all             → trigger all syncs

PROTECTED — Settings
──────────────────────
GET/PUT /api/settings
GET/PUT /api/settings/organization
GET/PUT /api/settings/budget
GET/PUT /api/settings/alert-rules

PROTECTED — Phase 2B (placeholder schema + stub handler)
──────────────────────────────────────────────────────────
GET/POST /api/alerts
GET/POST /api/notifications/channels
POST     /api/notifications/test
GET      /api/reports
GET      /api/audit-logs
GET      /api/data-retention

PROTECTED — Phase 3 (placeholder)
───────────────────────────────────
GET /api/roi/overview
GET /api/roi/by-team
GET /api/roi/trends
GET /api/recommendations
GET /api/recommendations/[id]
GET /api/intelligence/adoption-scores
GET /api/intelligence/team-efficiency
GET /api/intelligence/waste-scores
```

---

## 9 · Provider Architecture

```
modules/providers/
├── registry.ts              ← 8 providers registered with key + label + category
├── capabilities.ts          ← hasRealConnector(key) → true for anthropic/claude_code only
│
├── anthropic/
│   ├── connector.ts         ← Calls Anthropic Admin API (/v1/organizations/usage)
│   └── mapper.ts            ← Maps → AiUsageDaily
│
├── openai/
│   ├── connector.ts         ← Calls OpenAI Admin API (/v1/organization/usage)
│   └── mapper.ts
│
├── github_copilot/
│   ├── connector.ts         ← GitHub REST API (GET /orgs/{org}/copilot/billing/usage)
│   └── mapper.ts
│
├── cursor/
│   ├── connector.ts         ← Cursor Admin API
│   └── mapper.ts
│
└── microsoft_copilot/
    ├── connector.ts         ← Microsoft Graph API (reports/getM365CopilotUsageUserDetail)
    └── mapper.ts

Provider categories (for sidebar grouping):
  api_spend     → Anthropic, OpenAI, Gemini*, Perplexity*
  developer_ai  → Claude Code, GitHub Copilot, Cursor
  business_ai   → Microsoft 365 Copilot

* No connector — shown on /limitations only
```

---

## 10 · SEO & Metadata Infrastructure

```
app/
├── robots.ts               → GET /robots.txt
│                             Disallows: /api/, /dashboard, /ai-users,
│                             /ai-teams, /ai-models, /developer-ai-tools,
│                             /llm-spend, /business-productivity-ai,
│                             /alerts, /audit-logs, /notifications,
│                             /providers, /reports, /roi, /settings,
│                             /suggestions
│
├── sitemap.ts              → GET /sitemap.xml
│                             15 public URLs with lastmod + priority
│
├── opengraph-image.tsx     → Default OG image (all pages not overridden)
│   uses lib/og-render.tsx    1200×630, edge runtime
│                             Signal Gallery style: museum-black bg,
│                             emerald glow, corner tick marks
│
├── (marketing)/contact/
│   └── opengraph-image.tsx → /contact OG override
│
└── (marketing)/demo/
    └── opengraph-image.tsx → /demo OG override

lib/
├── site.ts      SITE_URL resolution:
│                NEXT_PUBLIC_SITE_URL → APP_URL → NEXT_PUBLIC_VERCEL_URL
│                → http://localhost:3000 (dev) → https://tokenlens.ai (prod)
│
└── og-render.tsx  Shared renderOg(title, subtitle) function
                   ImageResponse, edge runtime, 1200×630
```

---

## 11 · Shared Library Map

```
lib/
├── auth.ts
│   ├── createSession(userId, orgId, email, role) → signs JWT → sets cookie
│   ├── getSession(req?) → verifies cookie → SessionPayload | null
│   └── requireSession(req?) → SessionPayload or throw 401
│
├── prisma.ts
│   └── Prisma client singleton (global in dev, new in prod)
│
├── encryption.ts
│   ├── encrypt(plaintext) → "iv:ciphertext" (AES-256-GCM, ENCRYPTION_KEY)
│   └── decrypt(encrypted) → plaintext
│
├── rate-limit.ts
│   └── checkRateLimit(key, limit, windowMs) → { allowed: bool, remaining: int }
│       In-memory Map<string, {count, resetAt}> — resets per window
│
├── email.ts
│   ├── sendEmail({ to, subject, text, html?, replyTo? })
│   │     → { sent: true, id } | { sent: false, reason: "missing_config" | "send_failed" }
│   ├── notifyContact(id, createdAt, data)   — called fire-and-forget from /api/contact
│   ├── notifyDemo(id, createdAt, data)      — called fire-and-forget from /api/demo-request
│   └── leadNotificationRecipient()          — reads LEAD_NOTIFICATION_EMAIL env
│       Uses Resend v4. Safe: if RESEND_API_KEY unset → returns missing_config, never throws.
│
├── ip-hash.ts
│   ├── hashIp(ip) → SHA-256(ip + (JWT_SECRET || ENCRYPTION_KEY)) → 32-char hex
│   └── clientIp(req) → reads x-forwarded-for | x-real-ip
│
├── site.ts
│   └── SITE_URL — canonical base URL for OG + sitemap
│
├── og-render.tsx
│   └── renderOg(title, subtitle) → ImageResponse (edge, 1200×630)
│
└── table-styles.ts
    ├── TH, TR, TD, TD_MONO — shared table className strings
    └── CHART_COLORS — canonical 8-colour Recharts palette
```

---

## 12 · Design System Tokens

```
Signal Gallery theme (marketing):
  Background:    #0a0a0a (marketing dark)
  Accent primary:   #10b981  (emerald)
  Accent secondary: #06b6d4  (cyan)
  Accent anomaly:   #7C3AED  (violet — limited use, one of 5 tones)
  Font:          Plus Jakarta Sans  (--font-sans)
  Font data:     JetBrains Mono     (--font-data, numbers + tokens + costs)
  Theme class:   .signal-gallery    (scoped to marketing layout)

Dashboard theme:
  Sidebar bg:    #050810
  Page bg:       #060a12  (dark) / #f0f2f7 (light)
  Brand primary:    #10b981  (emerald)  — NEVER purple
  Brand secondary:  #06b6d4  (cyan)
  Charts:        CHART_COLORS from lib/table-styles.ts (Recharts only)
  Icons:         Lucide React only

Sidebar status badges:
  Coming Soon → amber "SOON" badge  (comingSoon: true in navGroups)
  Limited     → amber "LIMITED" badge (limited: true in navGroups)
```

---

## 13 · Build Modes

```
Server mode (default — required for full app):
  npm run build → Next.js Node.js server
  Serves: marketing + dashboard + API routes + proxy.ts + Prisma
  Host: Vercel / Railway / Render / DigitalOcean / AWS / Azure

Static export (marketing-only):
  NEXT_OUTPUT_MODE=export npm run build → ./out/ directory
  Serves: 13 marketing pages only (HTML/CSS/JS)
  Missing: API routes, auth, Prisma, sync workers, provider credentials
  Use case: GitHub Pages teaser, CDN static host

GitHub Pages workflow:
  .github/workflows/deploy-pages.yml.disabled
  Must rename to .yml to activate (marketing-only constraint)
```

---

## 14 · Environment Variables

```
Required (all modes):
  DATABASE_URL         postgresql://user:pass@host:5432/tokenlens
  JWT_SECRET           ≥32 random bytes (base64) — sessions
  ENCRYPTION_KEY       ≥32 random bytes (base64) — provider credential AES

Optional (marketing email + lead notification):
  RESEND_API_KEY       sk_... (Resend transactional email)
  EMAIL_FROM           noreply@yourdomain.com (verified sending domain)
  LEAD_NOTIFICATION_EMAIL  sales@yourdomain.com

Optional (canonical URL):
  NEXT_PUBLIC_SITE_URL  https://yourdomain.com
  APP_URL               (fallback)
  NEXT_PUBLIC_VERCEL_URL (auto-set by Vercel)

Build only:
  NEXT_OUTPUT_MODE      set to "export" for static-only build
  NEXT_PUBLIC_BASE_PATH  set to "/sub" if hosted under a subpath

Provider credentials:
  NOT in env vars. Entered via Settings UI → encrypted → stored in DB.
```

---

## 15 · Phase Roadmap

```
Phase 1  🟢 COMPLETE
  Anthropic + Claude Code with real Admin API data
  Dashboard, AI Users, AI Teams, AI Models
  Auth (3-layer), Settings, Provider credential encryption

Phase 2A  🟢 UI COMPLETE  🟡 Backend verification pending
  Multi-provider UI: OpenAI, GitHub Copilot, Cursor, M365 Copilot
  Connector + sync worker code present; not yet validated against real tenants
  Lead capture: /api/contact + /api/demo-request → Neon (verified end-to-end)
  Email notifier: Resend wired, pending RESEND_API_KEY env config
  SEO: robots.txt, sitemap.xml, OG images

Phase 2B  🔵 COMING SOON
  Alerts (AlertRule, Alert tables exist)
  Reports
  Audit Logs (AuditLog table exists)
  Notifications (NotificationChannel, NotificationDeliveryLog tables exist)
  Delivery channels: Slack / Teams / PagerDuty / Email (not wired)

Phase 3  ⚪ PLANNED
  AI ROI Dashboard
  Recommendations / Suggestions engine
  Adoption scoring, waste scoring, team efficiency scoring
  (Prisma tables exist; scoring engine not implemented)

Missing for paid customer launch:
  ❌ /api/auth/signup (signup page UI exists, endpoint not wired)
  ❌ Production hosting (Vercel/Railway/Render not configured)
  ❌ Non-Anthropic connector validation against real customer tenants
  ❌ Calendar booking for /demo (Cal.com / Calendly)
  ❌ Admin triage UI for ContactSubmission / DemoRequest rows
  ❌ MDX/blog content at /resources/[slug]
  ❌ CI pipeline (typecheck + build on PR)
```

---

*For the full per-URL inventory see [`docs/URL_INVENTORY.md`](URL_INVENTORY.md).
For GTM readiness see [`docs/GTM_READINESS.md`](GTM_READINESS.md).
For deployment instructions see [`docs/DEPLOYMENT.md`](DEPLOYMENT.md).*
