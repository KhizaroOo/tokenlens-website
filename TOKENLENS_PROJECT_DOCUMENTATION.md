# TokenLens — Complete Project Documentation

> **Version:** 1.0.0 — MVP  
> **Date:** May 2026  
> **Stack:** Next.js 16 · TypeScript · PostgreSQL · Prisma · Tailwind CSS v4

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication & Security](#6-authentication--security)
7. [API Routes Reference](#7-api-routes-reference)
8. [Frontend Pages](#8-frontend-pages)
9. [Sync Workers](#9-sync-workers)
10. [Anthropic API Integration](#10-anthropic-api-integration)
11. [Data Flow — End to End](#11-data-flow--end-to-end)
12. [Design System](#12-design-system)
13. [Environment Variables](#13-environment-variables)
14. [Key Libraries](#14-key-libraries)
15. [Business Rules & Constraints](#15-business-rules--constraints)
16. [Known Limitations & Future Phases](#16-known-limitations--future-phases)
17. [Setup & Commands](#17-setup--commands)

---

## 1. Product Overview

**TokenLens** is an AI Usage, Token, Cost, and Productivity Intelligence Dashboard for companies using Anthropic Claude and Claude Code. It gives engineering managers and CTOs a real-time view of:

- Token consumption and API costs per user, team, and model
- Developer productivity metrics from Claude Code (sessions, commits, pull requests, lines of code)
- Budget tracking and alerting when thresholds are exceeded
- CSV report exports for billing reconciliation

### Who Uses It
Companies using Anthropic's API through a **Console Organization** (not Claude.ai consumer plans). They connect their **Admin API key** and TokenLens reads usage data from Anthropic's admin endpoints.

### Two Modes
| Mode | Description |
|---|---|
| **Demo Mode** | Seeded fake data (25 users, 5 teams, 60 days) — works without any API key |
| **Real Mode** | Anthropic Admin API key connected — live data from your actual org usage |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon.tech cloud or local) |
| ORM | Prisma 5 |
| Auth | bcryptjs password hash + JWT (httpOnly cookie, 7-day expiry) |
| Encryption | AES-256-GCM (Node.js `crypto` built-in) |
| Charts | Recharts |
| Icons | Lucide React |
| Theming | next-themes (dark/light) |
| i18n | Custom context — EN, ES, FR, AR (with RTL support) |
| Validation | Zod |
| Date utils | date-fns |

---

## 3. Architecture Overview

```
Browser (Next.js Client Components)
        │
        ▼
Next.js App Router API Routes  (/app/api/...)
        │
        ├── lib/auth.ts          JWT session verification
        ├── lib/encryption.ts    AES-256-GCM encrypt/decrypt
        ├── lib/prisma.ts        Prisma client singleton
        │
        ▼
PostgreSQL (Neon.tech)
        │
        ├── Organization
        ├── User + OrganizationMember
        ├── Team + TeamMember
        ├── ProviderConnection     ← stores encrypted API key
        ├── UsageDaily             ← synced from Anthropic /v1/usage
        ├── ModelUsageDaily        ← synced from Anthropic /v1/usage
        ├── ClaudeCodeDaily        ← synced from Anthropic /v1/claude-code/usage
        ├── Budget
        ├── AlertRule + Alert
        └── AuditLog

Anthropic Admin API  (external)
        │
        ├── GET /v1/usage                  → token/cost data per user & model
        └── GET /v1/claude-code/usage      → dev sessions, commits, PRs
```

### Multi-tenancy
All DB queries are scoped by `organizationId` from the JWT session. No cross-org data leakage possible.

---

## 4. Project Structure

```
tokenlens/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # Login page (no sidebar)
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar + header wrapper
│   │   ├── dashboard/page.tsx          # Main overview dashboard
│   │   ├── users/
│   │   │   ├── page.tsx                # Users list
│   │   │   └── [userId]/page.tsx       # User detail page
│   │   ├── teams/
│   │   │   ├── page.tsx                # Teams list + create/manage
│   │   │   └── [teamId]/page.tsx       # Team detail page
│   │   ├── models/
│   │   │   ├── page.tsx                # Models list + charts
│   │   │   └── [modelName]/page.tsx    # Model detail page
│   │   ├── claude-code/page.tsx        # Claude Code productivity
│   │   ├── alerts/page.tsx             # Alert rules + recent alerts
│   │   ├── reports/page.tsx            # CSV report downloads
│   │   └── settings/page.tsx           # Org settings + API key + sync
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── dashboard/
│       │   ├── overview/route.ts
│       │   ├── trends/route.ts
│       │   └── top-models/route.ts
│       ├── users/
│       │   ├── route.ts
│       │   └── [userId]/details/route.ts
│       ├── teams/
│       │   ├── route.ts                # GET list + POST create
│       │   ├── [teamId]/details/route.ts
│       │   └── [teamId]/members/route.ts  # GET/POST/DELETE members
│       ├── models/
│       │   ├── route.ts
│       │   └── [modelName]/details/route.ts
│       ├── claude-code/route.ts
│       ├── alerts/route.ts
│       ├── reports/route.ts
│       ├── settings/
│       │   ├── route.ts
│       │   ├── organization/route.ts
│       │   ├── budget/route.ts
│       │   └── alert-rules/route.ts
│       └── provider/
│           ├── route.ts
│           ├── sync/route.ts           # Sync usage only
│           ├── sync-all/route.ts       # Sync usage + CC + alerts
│           └── sync-code/route.ts
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── AppHeader.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── MobileSidebarToggle.tsx
│   ├── dashboard/
│   │   ├── PageShell.tsx
│   │   ├── StatCard.tsx
│   │   ├── SectionCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── StatCardSkeleton.tsx
│   │   └── BackButton.tsx
│   └── ui/                            # shadcn/ui primitives
│       ├── button.tsx
│       ├── badge.tsx
│       └── skeleton.tsx
├── workers/
│   ├── sync-claude-usage.worker.ts    # Sync /v1/usage → UsageDaily + ModelUsageDaily
│   ├── sync-claude-code.worker.ts     # Sync /v1/claude-code/usage → ClaudeCodeDaily
│   └── alert-checker.worker.ts        # Check alert rules after every sync
├── lib/
│   ├── prisma.ts                      # Prisma singleton client
│   ├── auth.ts                        # JWT sign/verify + session helpers
│   ├── encryption.ts                  # AES-256-GCM encrypt/decrypt
│   ├── rate-limit.ts                  # In-memory rate limiter (login)
│   ├── constants.ts
│   ├── query-helpers.ts               # fmtUsd, fmtTokens, getDateRangeStart, maskKey
│   ├── table-styles.ts                # Shared Tailwind class constants for tables/charts
│   └── i18n/translations.ts           # EN, ES, FR, AR translations
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                        # Seeds 25 users, 5 teams, 60 days of demo data
└── contexts/
    └── LanguageContext.tsx            # i18n provider
```

---

## 5. Database Schema

### Organization
```
id, name, slug (unique), website?, timezone (default UTC),
monthlyBudgetUsd?, dataMode (demo|real), createdAt, updatedAt
```
Top-level tenant. All other records belong to an organization.

### User
```
id, email (unique), name, passwordHash, createdAt, updatedAt
```
A user can belong to multiple organizations via `OrganizationMember`.  
Auto-discovered users (from Anthropic API sync) get a locked `passwordHash` — they cannot log in until an admin resets their password.

### OrganizationMember
```
id, organizationId, userId, role (owner|admin|viewer), joinedAt
UNIQUE: [organizationId, userId]
```
Links users to organizations with a role.

### Team
```
id, organizationId, name, slug, createdAt, updatedAt
UNIQUE: [organizationId, slug]
```
Teams are created manually in TokenLens. Anthropic API has no team data.

### TeamMember
```
id, teamId, userId, joinedAt
UNIQUE: [teamId, userId]
```

### ProviderConnection
```
id, organizationId, provider (default "anthropic"),
encryptedApiKey?,
status (not_connected|connected|failed|disabled),
lastSyncAt?, lastSyncError?,
lastUsageSyncedAt?, lastClaudeCodeSyncedAt?,
createdAt, updatedAt
UNIQUE: [organizationId, provider]
```
Stores the AES-256-GCM encrypted Admin API key. Never stores plaintext.

### UsageDaily
```
id, organizationId, provider, date (Date only),
userEmail, teamId?,
inputTokens, outputTokens, cachedTokens, totalTokens,
totalCostUsd (Decimal 10,6),
createdAt, updatedAt
UNIQUE: [organizationId, provider, date, userEmail]
INDEX: [organizationId, date], [organizationId, userEmail]
```
One row per user per day. **Upsert with SET (not increment)** — Anthropic returns cumulative daily totals, so re-syncing overwrites the value.

### ModelUsageDaily
```
id, organizationId, provider, model, date,
inputTokens, outputTokens, cachedTokens, totalTokens,
totalCostUsd (Decimal 10,6),
createdAt, updatedAt
UNIQUE: [organizationId, provider, model, date]
```
One row per model per day. Same SET-on-upsert rule.

### ClaudeCodeDaily
```
id, organizationId, userEmail, teamId?, date,
sessions, commits, pullRequests, linesAdded, linesRemoved,
estimatedCostUsd (Decimal 10,6),
createdAt, updatedAt
UNIQUE: [organizationId, userEmail, date]
```
Developer productivity from Claude Code.

### Budget
```
id, organizationId, teamId?, name, limitUsd, period (daily|weekly|monthly),
createdAt, updatedAt
```

### AlertRule
```
id, organizationId, name, metric, threshold (Decimal 10,4),
operator (default "gt"), period (default "daily"),
enabled (Boolean), createdAt, updatedAt
```
Metrics: `org_monthly_cost`, `user_daily_cost`, `team_cost_usd`, `total_tokens`, etc.

### Alert
```
id, organizationId, alertRuleId, message, severity (info|warning|critical),
resolvedAt?, createdAt
```
Fired when a rule threshold is crossed after sync.

### AuditLog
```
id, organizationId, userId?, action, resource?, resourceId?, metadata (Json)?,
createdAt
INDEX: [organizationId, createdAt]
```

---

## 6. Authentication & Security

### Login Flow
1. `POST /api/auth/login` with `{ email, password }`
2. Rate limited: 10 attempts per minute per IP (in-memory)
3. bcryptjs compares password against `passwordHash`
4. On success: fetch first `OrganizationMember` → build JWT payload
5. JWT signed with `JWT_SECRET`, set as httpOnly cookie (`tl_session`), 7-day expiry
6. JWT payload: `{ userId, email, organizationId, role }`

### Session Verification
Every API route calls `requireSession()` which reads the cookie, verifies the JWT, and returns the payload. If invalid → 401.

### Role-Based Access
| Role | Can do |
|---|---|
| `owner` | Everything |
| `admin` | Create teams, assign users, edit settings |
| `viewer` | Read-only — all GET endpoints |

Create/update/delete operations check `session.role` and return 403 if not owner/admin.

### API Key Encryption
```
User pastes key in Settings UI
        ↓
POST /api/provider  { apiKey: "sk-ant-admin01-..." }
        ↓
lib/encryption.ts: encrypt(apiKey)
  → AES-256-GCM
  → 32-byte key from ENCRYPTION_KEY env var
  → Returns: "iv:authTag:ciphertext" (all hex)
        ↓
Stored in ProviderConnection.encryptedApiKey
        ↓
On sync: decrypt(encryptedApiKey) → raw key → Anthropic API call
```
The raw key is **never stored**, **never returned in API responses** (Settings shows only last 4 chars masked as `••••••••••••abcd`).

---

## 7. API Routes Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, sets httpOnly JWT cookie |
| POST | `/api/auth/logout` | Clears cookie |
| GET | `/api/auth/me` | Returns `{ user: { userId, email, organizationId, role, name } }` |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard/overview?days=30` | Spend, tokens, users, CC totals, topUsers, topTeams, provider info, recentAlerts |
| GET | `/api/dashboard/trends?days=30` | Daily cost+token series + model daily breakdown |
| GET | `/api/dashboard/top-models?days=30` | Top models with costShare%, tokenShare% |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | All org members with 30-day usage totals |
| GET | `/api/users/[userId]/details?days=30` | Profile, usage summary, CC summary, daily usage, recent alerts |

### Teams
| Method | Route | Description |
|---|---|---|
| GET | `/api/teams` | All teams with member count + 30-day cost |
| POST | `/api/teams` | Create a new team `{ name }` (admin/owner only) |
| GET | `/api/teams/[teamId]/details?days=30` | Team profile, usage, member breakdown, CC activity, alerts |
| GET | `/api/teams/[teamId]/members` | List current team members |
| POST | `/api/teams/[teamId]/members` | Add user to team `{ userId }` |
| DELETE | `/api/teams/[teamId]/members` | Remove user from team `{ userId }` |

### Models
| Method | Route | Description |
|---|---|---|
| GET | `/api/models` | All models with 30-day totals. Returns: `models[]` (aggregated) + `daily[]` (flat rows for chart pivot) |
| GET | `/api/models/[modelName]/details?days=30` | Model profile, cost analytics, daily usage |

### Claude Code
| Method | Route | Description |
|---|---|---|
| GET | `/api/claude-code` | Totals + daily series + per-user breakdown from ClaudeCodeDaily |

### Alerts
| Method | Route | Description |
|---|---|---|
| GET | `/api/alerts` | All alert rules + last 50 alerts |

### Reports (CSV download)
| Method | Route | Description |
|---|---|---|
| GET | `/api/reports?type=cost&days=30` | CSV: UsageDaily rows |
| GET | `/api/reports?type=tokens&days=30` | CSV: ModelUsageDaily rows |
| GET | `/api/reports?type=claude-code&days=30` | CSV: ClaudeCodeDaily rows |

### Settings
| Method | Route | Description |
|---|---|---|
| GET | `/api/settings` | Org info, budget, masked provider key, alert rules |
| PATCH | `/api/settings/organization` | Update org name, website, timezone |
| PATCH | `/api/settings/budget` | Upsert monthly budget |
| PUT | `/api/settings/alert-rules` | Batch upsert alert rules |

### Provider
| Method | Route | Description |
|---|---|---|
| GET | `/api/provider` | Get provider connection status |
| POST | `/api/provider` | Save/update encrypted API key |
| POST | `/api/provider/sync` | Sync usage only |
| POST | `/api/provider/sync-all` | Sync usage + Claude Code + check alerts |
| POST | `/api/provider/sync-code` | Sync Claude Code only |

---

## 8. Frontend Pages

### `/dashboard` — Main Dashboard
- **Date range selector:** 7d / 30d / 60d
- **Stat cards:** Total Spend, Total Tokens, Active Users, Claude Code Sessions
- **Charts:** Daily cost area chart, token breakdown bar chart, cost trend line chart
- **Tables:** Top Users (clickable → `/users/:id`), Top Models, Recent Alerts
- **Data:** Fetches `/api/dashboard/overview`, `/api/dashboard/trends`, `/api/dashboard/top-models`

### `/users` — Users List
- Lists all org members with their 30-day token + cost totals
- Clicking a row navigates to `/users/:userId`
- Shows name, email, team badge, role badge, tokens, cost

### `/users/[userId]` — User Detail
- KPI cards: total spend, tokens, CC sessions, commits
- Daily cost area chart
- Token breakdown bar chart
- Recent activity table
- Related alerts

### `/teams` — Teams List
- **"Create Team" button** → modal to create team with name
- **"Manage" button** per team → split-panel modal:
  - Left: current members (hover to remove)
  - Right: available org users (hover to add)
- Cost by team horizontal bar chart
- Team summary table with avg cost/member

### `/teams/[teamId]` — Team Detail
- Budget tracking, member breakdown table
- Claude Code activity chart

### `/models` — Models List
- Stat cards: models used, total tokens, total cost
- **Token Usage by Model** — line chart (daily, pivoted by model name)
- **Cost Share** — donut/pie chart per model
- Model details table (clickable → `/models/:modelName`)

### `/models/[modelName]` — Model Detail
- Cost analytics, daily cost area chart, stacked token bar chart

### `/claude-code` — Claude Code Productivity
- Stat cards: sessions, commits, PRs, cost
- Daily activity bar chart (sessions/commits/PRs)
- Developer breakdown table

### `/alerts` — Alerts
- Stat cards: active rules, triggered count, resolved count
- Alert rules table with rule condition and status
- Recent alerts feed with relative timestamps

### `/reports` — Reports
- Download cards per report type (Cost, Tokens, Claude Code)
- Each card has 7d / 30d / 90d download buttons
- Each button calls `/api/reports?type=...&days=...` → triggers CSV download

### `/settings` — Settings
- **Sync section:** "Sync Now" button (calls `/api/provider/sync-all`), shows last synced time, new users discovered count
- **Provider:** API key input (masked display), connect/disconnect
- **Organization:** name, website, timezone — saved to DB
- **Budget:** monthly budget input
- **Alert Rules:** toggle enabled/disabled, threshold inputs

---

## 9. Sync Workers

### `sync-claude-usage.worker.ts`

**Purpose:** Fetches token/cost usage from Anthropic Admin API and stores in DB.

**Flow:**
```
1. Load ProviderConnection for org → decrypt API key
2. Call ClaudeAdminClient.getUsage(start, end) → paginated entries
3. ensureUsersExist() — auto-create User + OrganizationMember for new emails
4. For each entry:
   a. Upsert UsageDaily (SET — not increment)
   b. Upsert ModelUsageDaily (SET — not increment)
5. Update ProviderConnection.lastUsageSyncedAt
6. Return { synced, newUsers }
```

**Key design — SET not INCREMENT:**
Anthropic returns cumulative daily totals. Syncing twice a day would double-count if using `increment`. The `update` block uses SET so re-syncing the same day replaces the value correctly.

**User auto-discovery:**
```
ensureUsersExist(organizationId, emails, emailToTeamId)
  Case 1: email in User table, no OrganizationMember for this org
          → Create OrganizationMember (role: viewer) only
  Case 2: email not in User table at all
          → Create User (locked passwordHash) + OrganizationMember
  Case 3: already has User + OrganizationMember
          → Do nothing
```

### `sync-claude-code.worker.ts`

**Purpose:** Fetches Claude Code developer productivity data.

**Flow:**
```
1. Load ProviderConnection → decrypt key
2. GET https://api.anthropic.com/v1/claude-code/usage?start_date=...&end_date=...
3. For each entry: Upsert ClaudeCodeDaily (SET)
4. Update ProviderConnection.lastClaudeCodeSyncedAt
```

**Headers required:**
```
x-api-key: <admin-key>
anthropic-version: 2023-06-01
anthropic-beta: claude-code-usage-2024-10-07
```

### `alert-checker.worker.ts`
Called after every sync. Evaluates all enabled `AlertRule` records against the latest data. Creates `Alert` records when thresholds are exceeded.

---

## 10. Anthropic API Integration

### Which Account Type is Required
| Account Type | Supported |
|---|---|
| Free / Pro / Max Claude.ai | ❌ No API access |
| Claude Team / Enterprise (chat plans) | ❌ No Admin API |
| Console Org — Standard API key (`sk-ant-api03-...`) | ❌ 403 on admin endpoints |
| **Console Org — Admin API key (`sk-ant-admin01-...`)** | ✅ **Required** |

### Endpoints Used
```
GET /v1/usage
  Query params: start_date, end_date
  Returns: paginated array of { user_id (email), model, input_tokens,
           output_tokens, cache_read_input_tokens, cost_usd, start_time }
  Cost: $0 — free management endpoint

GET /v1/claude-code/usage
  Query params: start_date, end_date
  Returns: { data: [{ user_email, date, sessions, commits, pull_requests,
             lines_added, lines_removed, estimated_cost_usd }] }
  Cost: $0 — free management endpoint
```

### Important Limitations
- **No team data** — Anthropic returns `user_email` only. Teams must be manually created and users manually assigned in TokenLens.
- **Sync window** — Currently hardcoded to last 7 days per sync call. Run daily to build up history.
- **No real-time webhooks** — Sync is pull-based (manual or scheduled).
- **Cumulative daily totals** — Anthropic aggregates per user per day. Not per-session or per-request.

---

## 11. Data Flow — End to End

```
┌─────────────────────────────────────────────────────────┐
│                    SETUP (one-time)                      │
│                                                          │
│  1. Admin logs in (admin@tokenlens.ai / admin123)        │
│  2. Settings → paste Admin API key                       │
│  3. Key encrypted (AES-256-GCM) → saved to DB           │
│  4. Status: "connected"                                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   SYNC (manual)                          │
│                                                          │
│  Click "Sync Now" → POST /api/provider/sync-all          │
│       │                                                  │
│       ├── syncClaudeUsage()                              │
│       │     GET /v1/usage (last 7 days)                  │
│       │     Auto-create users seen in data               │
│       │     Upsert UsageDaily + ModelUsageDaily (SET)    │
│       │                                                  │
│       ├── syncClaudeCodeAnalytics()                      │
│       │     GET /v1/claude-code/usage (last 7 days)      │
│       │     Upsert ClaudeCodeDaily (SET)                 │
│       │                                                  │
│       └── checkAlerts()                                  │
│             Evaluate AlertRules against fresh data       │
│             Create Alert records for violations          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 TEAM MAPPING (manual)                    │
│                                                          │
│  Teams page → "Create Team" → modal → save to DB        │
│  Teams page → "Manage" → split panel                    │
│    Left: current members                                 │
│    Right: available org users (from sync)                │
│  Click + → POST /api/teams/:id/members → DB             │
│                                                          │
│  Next sync → UsageDaily rows tagged with teamId          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 DASHBOARD DISPLAY                        │
│                                                          │
│  All pages fetch from /api/* routes                      │
│  All queries scoped by organizationId from JWT           │
│  Charts rendered by Recharts                             │
│  Data refreshes on page navigation                       │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| Primary accent | `#10b981` (emerald-500) | Buttons, active nav, highlights |
| Secondary accent | `#06b6d4` (cyan-500) | Charts, badges |
| Indigo | `#6366f1` | Tertiary charts |
| Amber | `#f59e0b` | Warnings, cost |
| Sidebar bg | `#050810` | Dark navy |
| Content bg | CSS var `--background` | Light/dark adaptive |

### Component Hierarchy
```
PageShell          → wraps every dashboard page (title + header + main)
  AppHeader        → top bar with title, actions, theme toggle, language switcher
  SectionCard      → white card with title/subtitle
    StatCard       → KPI metric card with icon, value, change indicator
    StatCardSkeleton → loading skeleton
    EmptyState     → empty / error state with icon
    StatusBadge    → active / inactive / warning pill
    BackButton     → ← back navigation
```

### Chart Colors (Recharts)
```ts
CHART_COLORS = {
  emerald: "#10b981",
  cyan:    "#06b6d4",
  indigo:  "#6366f1",
  amber:   "#f59e0b",
  rose:    "#f43f5e",
}
```

### Table Styles (shared constants in `lib/table-styles.ts`)
```ts
TH       — table header cell
TR       — table row with hover
TD       — regular table data cell
TD_MONO  — monospace numeric cell
TEAM_PILL — team badge pill
```

### i18n
Supported languages: **English (EN), Spanish (ES), French (FR), Arabic (AR)**  
Arabic enables RTL layout automatically.  
Language switcher in the header. Translations live in `lib/i18n/translations.ts`.

---

## 13. Environment Variables

```env
# PostgreSQL — pooled connection (Prisma default)
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# PostgreSQL — direct connection (for migrations/Prisma Studio)
DIRECT_URL="postgresql://user:pass@host/dbname?sslmode=require"

# JWT — minimum 32 characters, random
# Generate: openssl rand -base64 32
JWT_SECRET="your-secret-here"

# AES-256-GCM encryption key — must be 32 bytes, base64 encoded
# Generate: openssl rand -base64 32
ENCRYPTION_KEY="your-32-byte-base64-key-here"

# App base URL
APP_URL="http://localhost:3000"

# Node environment
NODE_ENV="development"
```

**Never share or commit `JWT_SECRET` or `ENCRYPTION_KEY`.**  
If either changes, all existing sessions are invalidated and all encrypted API keys become unreadable.

---

## 14. Key Libraries

| Library | Version | Purpose |
|---|---|---|
| `next` | 16.2.6 | Full-stack framework, App Router |
| `react` | 19.2.4 | UI |
| `prisma` / `@prisma/client` | 5.22.0 | ORM + type-safe DB queries |
| `bcryptjs` | 3.0.3 | Password hashing |
| `jsonwebtoken` | 9.0.3 | JWT sign/verify |
| `recharts` | 3.8.1 | All charts (line, bar, pie, area) |
| `lucide-react` | 1.14.0 | All icons |
| `next-themes` | 0.4.6 | Dark/light mode |
| `date-fns` | 4.1.0 | Date math (subDays, startOfDay, formatDistanceToNow) |
| `zod` | 4.4.3 | Request body validation in API routes |
| `tailwind-merge` | 3.6.0 | Merge Tailwind class names safely |
| `clsx` | 2.1.1 | Conditional class names |

---

## 15. Business Rules & Constraints

1. **All API routes require auth** — `requireSession()` called on every route. Returns 401 if cookie missing/invalid.

2. **All DB queries scoped by `organizationId`** — Never query without this filter. Prevents cross-tenant data access.

3. **Never store raw API keys** — Only AES-256-GCM ciphertext. Decrypt only in worker at sync time.

4. **Upsert with SET, not increment** — Anthropic returns cumulative daily totals. Re-syncing the same day replaces the value.

5. **User auto-discovery** — New emails seen in Anthropic usage data that don't exist in DB are auto-created as `viewer` members with a locked `passwordHash`. They appear immediately in the Users page.

6. **Teams are manual** — Anthropic has no team concept. Teams created in TokenLens, users assigned manually. Usage gets tagged with `teamId` on next sync after assignment.

7. **One ProviderConnection per org per provider** — Unique constraint on `[organizationId, provider]`.

8. **Decimal fields** — `totalCostUsd` is stored as `Decimal(10,6)` in Postgres. Must always call `Number(...)` when reading from Prisma groupBy results in API routes (Prisma returns Decimal objects, not plain numbers).

9. **Sync window** — Last 7 days per sync. Run daily to maintain rolling history. 30/60/90-day views work once enough syncs have been accumulated.

10. **MVP scope** — Claude (Anthropic) only. No OpenAI, GitHub Copilot, Gemini, Cursor support in v1.

---

## 16. Known Limitations & Future Phases

### Current Limitations (v1)
| Limitation | Detail |
|---|---|
| Sync is manual | No auto-sync — must click "Sync Now" |
| 7-day sync window | No one-click historical backfill > 7 days |
| No team data from Anthropic | Teams created/assigned manually |
| No per-request breakdown | Anthropic returns daily aggregates only |
| No real-time alerts | Alerts only checked after sync |
| No email/Slack notifications | Alerts visible in UI only |
| Single provider | Claude (Anthropic) only |

### Planned Next Phase
| Feature | Description |
|---|---|
| **Auto-sync (Cron)** | Vercel Cron / node-cron — every 1h, 6h, 24h (configurable in Settings) |
| **Full Backfill** | "Full Backfill" button fetches 90 days on demand |
| **Alert notifications** | Email / Slack webhook when alert fires |
| **User invite flow** | Invite users by email — they set their own password |
| **Team budget enforcement** | Hard budget caps with auto-alert |
| **Audit log UI** | View all admin actions from AuditLog table |

---

## 17. Setup & Commands

### Prerequisites
- Node.js 20+
- PostgreSQL (local Docker or free Neon.tech cloud)
- Anthropic Console Organization with Admin API key (for real data)

### Quick Start
```bash
# 1. Clone and install
npm install

# 2. Create .env file (copy from .env.example and fill in values)
cp .env.example .env

# 3. Push schema to DB
npm run db:push

# 4. Seed demo data (optional — 25 users, 5 teams, 60 days)
npm run db:seed

# 5. Start dev server
npm run dev
```

### Default Login (after seed)
```
URL:      http://localhost:3000/login
Email:    admin@tokenlens.ai
Password: admin123
```

### All Commands
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check

npm run db:push      # Push schema changes to DB (no migration files)
npm run db:seed      # Seed demo data (wipes existing data first)
npm run db:studio    # Open Prisma Studio (visual DB browser)

docker-compose up -d # Start local PostgreSQL + Redis
```

### Connect Real Anthropic Data
```
1. Log in → Settings
2. Provider section → paste sk-ant-admin01-... key → Save
3. Click "Sync Now"
4. Wait ~2-5 seconds
5. Dashboard, Users, Models pages show real data
6. Go to Teams → Create Team → Manage → assign synced users
```

---

## Appendix — Anthropic Admin API Key Notes

| Topic | Detail |
|---|---|
| Key prefix | `sk-ant-admin01-...` (different from workspace keys `sk-ant-api03-...`) |
| Where to generate | console.anthropic.com → Settings → API Keys → Create Admin Key |
| What it unlocks | `/v1/usage`, `/v1/claude-code/usage`, user/workspace management |
| Cost to call | **$0** — admin endpoints are free |
| Standard key limitation | `sk-ant-api03-...` keys return 403 on admin endpoints |
| Supported plans | Console Organizations only — not Claude.ai subscriptions |

---

*This document covers TokenLens v1.0.0 MVP. For questions about extending this codebase, refer to each section's detail and the inline code comments.*
