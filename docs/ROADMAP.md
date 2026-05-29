# ROADMAP.md

> TokenLens release plan, grounded in what's actually in the repo today.
> Verified on **2026-05-28**.

---

## Phase 1 — 🟢 Complete

**Theme:** Single-provider MVP (Anthropic). Prove the core dashboard and auth model.

| Item | Status |
|---|---|
| Anthropic Claude integration via Admin API (`sync-claude-usage.worker.ts`) | 🟢 Live |
| Claude Code integration (reuses Anthropic credential) | 🟢 Live |
| Auth model — bcrypt + JWT in `tl_session` httpOnly cookie | 🟢 Live |
| Core Prisma schema (Organization, User, Team, ProviderConnection, UsageDaily, ModelUsageDaily, ClaudeCodeDaily, ProviderSyncRun, AuditLog) | 🟢 Live |
| Dashboard overview page | 🟢 Live |
| AI Users (list + `[userId]` detail) | 🟢 Live |
| AI Teams (list + `[teamId]` detail) | 🟢 Live |
| AI Models (list + `[modelName]` detail) | 🟢 Live |
| Claude Code dedicated page | 🟢 Live |
| Basic Settings — credential storage (AES-256-GCM), manual sync trigger | 🟢 Live |

---

## Phase 2A — 🟢 UI complete, 🟡 backend verification pending

**Theme:** Multi-provider expansion + public marketing site.

| Item | Status |
|---|---|
| Provider registry for 8 providers | 🟢 Live |
| `ProviderConnection` per-provider credential storage | 🟢 Live |
| OpenAI connector + sync worker | 🟡 Implementation present; production validation pending |
| GitHub Copilot connector + sync worker | 🟡 Implementation present; production validation pending |
| Cursor connector + sync worker | 🟡 Implementation present; production validation pending |
| Microsoft 365 Copilot connector + sync worker | 🟡 Implementation present; production validation pending |
| `AiUsageDaily`, `AiModelUsageDaily`, `DeveloperAiDaily`, `SeatUsageDaily`, `BusinessAiDaily` tables | 🟢 Live (schema), 🟡 (data flow per-provider) |
| Developer AI Tools module (overview + 3 sub-pages) | 🟢 Live |
| LLM/API Spend module (overview + 2 sub-pages) | 🟢 Live |
| Business Productivity AI module (overview + 1 sub-page) | 🟢 Live |
| Providers list page (`/providers`) | 🟢 Live |
| Provider Limits page (`/limitations`) | 🟢 Live |
| Demo data fallback when no credentials present (`prisma/seed.ts`) | 🟢 Live |
| Public marketing website (13 pages, Signal Gallery theme) | 🟢 Live |
| Marketing dashboard screenshot integration | 🟢 Live |

---

## Phase 2B — 🟡 Mixed: schema present, customer-facing UI/flow not yet shipped

**Theme:** Production validation of multi-provider + governance & lead-capture launch blockers.

### 2B-a · Production validation of Phase 2A connectors

| Item | Status |
|---|---|
| OpenAI connector — verified on real customer tenant | 🟡 Pending |
| GH Copilot connector — verified on real customer tenant | 🟡 Pending |
| Cursor connector — verified on real customer tenant | 🟡 Pending |
| M365 Copilot connector — verified on real customer tenant | 🟡 Pending |

### 2B-b · Governance UIs

| Item | Status |
|---|---|
| `/alerts` page (placeholder shipped, list/edit UI pending) | 🔵 Coming Soon |
| `/reports` page | 🔵 Coming Soon |
| `/audit-logs` page (`AuditLog` table exists, query UI pending) | 🔵 Coming Soon |
| `/notifications` page | 🔵 Coming Soon |
| Notification delivery — email | 🔵 Coming Soon |
| Notification delivery — Slack | 🔵 Coming Soon |
| Notification delivery — Teams | 🔵 Coming Soon |
| Notification delivery — PagerDuty | 🔵 Coming Soon |
| Anomaly detection engine (uses `AlertRule` + `Alert` tables) | 🔵 Coming Soon |
| Scheduled report generation + PDF export | 🔵 Coming Soon |
| Data retention policy enforcement (uses `DataRetentionPolicy` table) | 🟡 Schema present |

### 2B-c · Lead-capture / public-launch blockers

| Item | Status |
|---|---|
| `/api/contact` POST endpoint + DB persistence | 🚫 Not built |
| `/api/demo-request` POST endpoint | 🚫 Not built |
| Calendar booking integration (Cal.com / Calendly) | 🚫 Not built |
| `/api/auth/signup` endpoint | 🚫 Not built |
| `app/robots.ts` + `app/sitemap.ts` | 🚫 Not built |
| OG image artwork (1200×630) | 🚫 Not built |
| `/resources/[slug]` MDX collection | 🚫 Not built |
| Production hosting (Vercel/Railway/Render/etc.) | 🚫 Not set up |
| Basic CI (typecheck + build on PR) | 🚫 Not set up |

---

## Phase 3 — ⚪ Planned

**Theme:** Intelligence + advanced governance.

| Item | Status |
|---|---|
| AI ROI dashboard (`/roi`) | ⚪ Placeholder UI; tables exist (`AiAdoptionScoreDaily`, etc.) |
| Recommendations / Suggestions engine (`/suggestions`) | ⚪ Placeholder UI; `Recommendation` table exists |
| Adoption scoring engine | ⚪ Table exists (`AiAdoptionScoreDaily`); scorer not implemented |
| Team efficiency scoring | ⚪ Table exists (`TeamEfficiencyScoreDaily`); scorer not implemented |
| Waste detection scoring | ⚪ Table exists (`AiWasteScoreDaily`); scorer not implemented |
| GitHub PR / commit correlation (uses `GitHubRepository`, `GitHubPullRequestDaily`, `GitHubCommitDaily`) | ⚪ Schema only |
| Jira correlation (uses `JiraProject`, `JiraIssueDaily`) | ⚪ Schema only |
| Productivity correlation (uses `ProductivityCorrelationDaily`) | ⚪ Schema only |
| Board-ready PDF export | ⚪ Not built |
| One-click seat reclaim workflow | ⚪ Not built |
| SOC 2 Type II certification | ⚪ Planned post-revenue milestone |
| SSO / SAML | ⚪ "ready positioning" today; integration on Phase 3 |

---

## Decision: do not collapse phases without verification

If a connector exists in code, **do not move it to Phase 2A "live" status in the docs** until a real customer tenant verifies it. Use 🟡 "Implementation present; production validation pending" until then.

---

## Suggested sequencing (engineering priority)

1. **Phase 2B-c blockers** (contact/demo/signup endpoints + production hosting) — unblock paid customer launch.
2. **Phase 2B-a validation** — pick one customer per non-Anthropic provider, run a full sync, graduate each to 🟢.
3. **Phase 2B-b governance** — start with email-only notifications (lowest integration cost), then add Slack/Teams/PagerDuty.
4. **Phase 3 intelligence** — start with the simplest scoring (waste detection from existing seat data) to deliver an early "wow" moment.
