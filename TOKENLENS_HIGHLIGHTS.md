# TokenLens — Complete Application Highlights

---

## 1. Product Identity

### What Is TokenLens?

TokenLens is an **AI Usage, Token Cost & Productivity Intelligence Dashboard** built for organisations that use multiple AI tools simultaneously. It connects to the admin APIs of every major AI platform — LLM providers, developer coding assistants, and business productivity apps — and consolidates all usage data, cost data, and productivity metrics into a single unified dashboard.

### The Problem It Solves

Modern organisations are paying for AI from multiple directions at once: developers using Claude Code and GitHub Copilot, engineering teams calling OpenAI and Anthropic APIs in their products, and the entire company using Microsoft Copilot in Office 365. Without a central intelligence layer:

- Finance teams cannot see where AI money is going
- Engineering managers cannot compare productivity across tools
- Leadership cannot justify AI spend to the board
- No one knows which seats are idle, which models are over-provisioned, or where costs are spiking

TokenLens closes that gap.

### Who It Is For

| Persona | What They Get |
|---------|--------------|
| **CTOs / VPs of Engineering** | Full AI estate overview — all providers, all costs, one screen |
| **Finance & Operations** | Cost attribution by team, provider, and model for budget reviews |
| **Engineering Managers** | Per-developer productivity metrics, adoption rates, idle seat detection |
| **Compliance / IT Security** | Audit logs, data retention policies, encrypted credential storage |
| **Platform / DevOps Teams** | Provider sync status, alert rules, manual and scheduled data pulls |

### Tagline
> *Track token usage, costs & productivity across all your AI tools.*

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui + Base UI | Latest |
| Charts | Recharts | 3.8.1 |
| Icons | Lucide React | 1.14.0 |
| Database | PostgreSQL | Latest (Neon / self-hosted) |
| ORM | Prisma | 5.22.0 |
| Auth | JWT (httpOnly cookie) + bcryptjs | — |
| Encryption | AES-256-GCM | Node.js crypto |
| Validation | Zod | 4.4.3 |
| Date Utilities | date-fns | 4.1.0 |
| Theming | next-themes | 0.4.6 |
| Fonts | Plus Jakarta Sans + JetBrains Mono | Google Fonts |

### Key npm Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:generate  # Regenerate Prisma client
```

---

## 3. Application Architecture

### Directory Structure

```
app/
  (auth)/             # Login page — no sidebar, no session required
  (dashboard)/        # All dashboard pages — sidebar + header, session required
    dashboard/        # Provider overview hub
    ai-users/         # User analytics + drill-down
    ai-teams/         # Team analytics + drill-down
    ai-models/        # Model analytics + drill-down
    developer-ai-tools/   # Dev AI hub + Claude Code, GitHub Copilot, Cursor
    llm-spend/        # LLM API spend hub + Claude, OpenAI detail pages
    business-productivity-ai/  # Microsoft Copilot
    roi/              # AI ROI (Coming Soon)
    suggestions/      # Suggestions (Coming Soon)
    alerts/           # Alerts (Coming Soon)
    notifications/    # Notifications (Coming Soon)
    reports/          # Reports (Coming Soon)
    audit-logs/       # Audit Logs (Coming Soon)
    limitations/      # Provider Limits
    settings/         # Provider configuration + sync
  api/                # All API routes (Next.js Route Handlers)

components/
  layout/             # AppSidebar, AppHeader, LanguageSwitcher, ThemeToggle
  dashboard/          # PageShell, SectionCard, StatCard, EmptyState, Skeletons

lib/                  # auth.ts, encryption.ts, prisma.ts, utils.ts, table-styles.ts
modules/
  providers/          # Provider registry, types, capabilities, connector interfaces
workers/              # Data sync workers (one per provider)
prisma/               # schema.prisma, seed.ts
contexts/             # LanguageContext (i18n)
types/                # Shared TypeScript types
```

### Route Groups

- **(auth)** — Public-facing pages. No sidebar rendered. Session is not required.
- **(dashboard)** — All protected pages. Renders AppSidebar + AppHeader wrapper. Every API call inside requires a valid session and all database queries are scoped to organizationId.

### Request Lifecycle

1. User visits any dashboard route
2. AppSidebar calls GET /api/auth/me — if 401, redirects to /login
3. Dashboard page mounts, fires its data fetch to the relevant API route
4. API route calls requireSession() — extracts organizationId from JWT
5. All Prisma queries include WHERE organizationId = ?
6. Data is returned and rendered into charts and tables

### Provider Connector Pattern

```
Settings page: User enters API key
     ↓
POST /api/providers/[key]
     ↓
testConnection() — verify key is valid
     ↓
encrypt(apiKey) via AES-256-GCM
     ↓
Store in ProviderConnection table
     ↓
Manual or scheduled sync triggered
     ↓
Worker: decrypt(encryptedKey) → call provider API
     ↓
Upsert daily usage rows into DB
     ↓
markProviderSynced() — update lastSyncAt
```

---

## 4. Design System

### Color Palette

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|-----------|-------|
| Background | #060a12 | #f0f2f7 | Page background |
| Sidebar | #050810 | #050810 | Always dark sidebar |
| Card | #0d1424 | #ffffff | Card surfaces |
| Foreground | #e8edf5 | #0f1629 | Primary text |
| Muted | #0d1829 | #eef1f8 | Subtle backgrounds |
| Primary (Brand) | #10b981 | #10b981 | Emerald — buttons, active states |
| Accent | #06b6d4 | #06b6d4 | Cyan — secondary highlights |
| Border | white/6% | slate-200 | Card and table borders |

### Typography

| Font | Role | Features |
|------|------|---------|
| Plus Jakarta Sans | UI text, labels, headings | Weights 300–800, OpenType cv02/cv03/cv04/cv11 |
| JetBrains Mono | Numbers, tokens, costs, code | Tabular numerals, monospaced |

All currency values, token counts, and metrics use font-data (JetBrains Mono) to ensure numbers align perfectly in tables and stat cards.

### Visual Effects

| Effect | CSS Class | Description |
|--------|-----------|-------------|
| Glass morphism | .glass | backdrop-blur(16px) saturate(180%) |
| Gradient text | .gradient-text | Emerald to Cyan linear gradient on text |
| Emerald glow | .glow-emerald | Emerald box shadow for active indicators |
| Card shadow | .card-shadow | Depth shadow, enhanced on hover |
| Gradient border | .gradient-border | Pseudo-element emerald border accent |

### Animations

| Name | Duration | Usage |
|------|----------|-------|
| fadeUp | 0.3s | Page content entrance |
| pulse-glow | 2s infinite | Active connection indicators |
| shimmer | 1.5s | Loading skeleton placeholders |
| Theme transition | 150ms | Background/color changes on theme switch |

### Theme Toggle

Users can switch between dark mode (default) and light mode. The sidebar always remains dark regardless of theme selection — preserving the premium SaaS aesthetic in both modes.

### Chart Colors

- Emerald #10b981 — Primary metric lines
- Cyan #06b6d4 — Secondary comparisons
- Indigo #6366f1 — Tertiary lines
- Amber #f59e0b — Cost and spend indicators
- Red #ef4444 — Alerts and anomalies

---

## 5. Internationalisation (i18n)

### Supported Languages

| Code | Language | Direction |
|------|---------|-----------|
| en | English | LTR |
| es | Español | LTR |
| fr | Français | LTR |

### How It Works

- Language preference is stored in localStorage under the key tl_locale
- On load, LanguageContext sets document.documentElement.lang and document.documentElement.dir
- The useTranslation() hook is available globally in any component
- The LanguageSwitcher component in the header shows the active locale code (EN / ES / FR) and a dropdown to change it

### Translation Coverage

Translations exist for: navigation labels, dashboard stats, user/team/model tables, alert messages, report headers, settings page, login page, and all common UI strings (loading, empty states, errors).

---

## 6. Security and Authentication

### Authentication Flow

```
POST /api/auth/login { email, password }
  → validateCredentials() — bcrypt.compare against stored hash
  → getUserMembership() — fetch org + role from DB
  → signToken() — create JWT { userId, email, organizationId, role }
  → setSessionCookie() — httpOnly, secure (prod), sameSite=lax, 7-day max-age
  → Redirect to /dashboard
```

### Session Security

| Measure | Implementation |
|---------|---------------|
| Cookie type | httpOnly — inaccessible to JavaScript |
| Cookie security | secure flag enabled in production |
| CSRF protection | sameSite=lax prevents cross-site form submission |
| Expiry | 7 days; re-auth required after expiry |
| Scope | Every API query includes WHERE organizationId = ? |

### Provider Credential Security

All API keys entered in Settings are encrypted before being stored in the database:

```
plaintext API key
  → AES-256-GCM encryption (12-byte random IV, 16-byte auth tag)
  → Base64-encoded ciphertext (IV + tag + encrypted data)
  → Stored in ProviderConnection.encryptedApiKey
```

Decryption only happens inside sync workers at the moment of API call — keys are never logged, returned to the client, or stored in plaintext anywhere in the system.

### Additional Security Measures

- Rate limiting: Login endpoint is capped at 10 requests per minute per IP
- No content storage: TokenLens never stores prompt text, code content, or AI response content — metadata only (tokens, costs, dates, model names)
- Role-based access: Organisation members have roles (owner, admin, viewer) stored at the membership level

---

## 7. Feature Modules

This section describes every module in TokenLens in full detail — what data is displayed on each page and the precise business value it delivers to companies that provide AI tools to their employees.

---

### 7.1 Dashboard
**Status:** ✅ Live  |  **Route:** `/dashboard`

#### What Information Is Shown
The Dashboard is the first screen every user sees after login. It presents a live, categorised overview of every AI provider the organisation has connected — grouped into three categories: LLM/API Spend Providers, Developer AI Tools, and Business Productivity AI. For each provider a card displays:
- **Connection status** — whether the provider is live and syncing or not yet configured
- **Total cost over the last 30 days** — exact dollar spend pulled from the admin API
- **Total token volume** — combined input + output token consumption
- **Active user count or active seat count** — how many employees are actively using it
- **Last sync timestamp** — confirming data freshness

At the top of the page, four summary stat cards show organisation-wide totals: number of providers tracked, number of live connections, total AI spend (30 days), and total tokens consumed (30 days).

#### How It Helps the Business
For a company that has deployed AI tools across multiple teams, the Dashboard answers the most urgent question every CTO and CFO asks before a board meeting: *"How much are we spending on AI and is it all connected?"* Rather than logging into four different admin portals, switching between spreadsheets, and manually totalling numbers, the executive opens TokenLens and sees the complete AI estate on one screen in under five seconds. This is the foundation that makes every other conversation about AI spend data-driven rather than anecdotal.

---

### 7.2 Intelligence — AI Users
**Status:** ✅ Live  |  **Route:** `/ai-users` and `/ai-users/[userId]`

#### What Information Is Shown
The AI Users page lists every individual across the organisation who is consuming AI tokens or using AI seats. The main table shows each user with:
- **Full name and email address**
- **Total cost attributed to them over the last 30 days**
- **Total tokens consumed** (input + output combined)
- **Which providers they are active on** — Claude, OpenAI, GitHub Copilot, etc.
- **Team they belong to**
- **30-day usage trend** — whether their consumption is rising, falling, or flat

Clicking into an individual user opens their profile page, which shows:
- **Input vs. output token ratio** — revealing whether they are sending large prompts or generating large responses
- **Top models they call** — which specific AI models this user uses most
- **Daily cost trend chart** — a line graph of their spend over the last 30 days, showing spikes and drops
- **Provider breakdown** — how their usage is split across Anthropic, OpenAI, and other connected tools
- **Team context** — which squad they belong to for cost allocation

#### How It Helps the Business
Companies deploying AI tools to employees face a consistent problem: they know the total bill but have no idea who is responsible for it. AI Users solves this with person-level accountability. When the monthly API invoice arrives and it is 40% higher than budgeted, the engineering manager opens TokenLens and immediately sees which three developers are responsible for 60% of the cost — and whether that usage correlates to legitimate work or runaway automation scripts. For HR and finance, it enables fair cost attribution: AI spend can be charged back to the team or individual who generated it. For IT security, it surfaces suspicious patterns — a user whose token consumption suddenly triples overnight without explanation is a red flag that this feature makes impossible to miss.

---

### 7.3 Intelligence — AI Teams
**Status:** ✅ Live  |  **Route:** `/ai-teams` and `/ai-teams/[teamId]`

#### What Information Is Shown
The AI Teams page aggregates all AI usage at the team or department level. The main view shows each team with:
- **Team name and member count**
- **Total AI cost over the last 30 days** across all providers
- **Total tokens consumed** by all team members combined
- **Cost per member average** — total team cost divided by headcount
- **Trend indicator** — whether team-level spend is increasing or decreasing

The team drill-down page shows:
- **All team members** with their individual cost and token rows
- **Team-level daily cost trend chart** — line graph of combined spend over 30 days
- **Provider breakdown** — how the team's usage is distributed across Claude, OpenAI, Copilot, etc.
- **Top models used** by this team collectively

#### How It Helps the Business
Finance teams in companies with AI at scale need cost attribution at the business unit level — not just per-user, but per-squad, per-department, per-cost-centre. AI Teams makes this automatic. A company with a 200-person engineering organisation split across eight squads can see exactly which squads consume the most AI and at what cost per person — with no manual data collection required. This enables chargeback models: where AI spend is billed back to the business unit that generated it, creating accountability and encouraging thoughtful usage. It also enables benchmarking: if the data infrastructure team spends $18 per developer per month on AI and the product team spends $6, leadership can investigate whether that reflects genuine productivity difference or inefficient usage patterns.

---

### 7.4 Intelligence — AI Models
**Status:** ✅ Live  |  **Route:** `/ai-models` and `/ai-models/[modelName]`

#### What Information Is Shown
The AI Models page provides a cross-provider breakdown of every AI model being called by the organisation's applications and employees. For each model — `claude-3-5-sonnet-20241022`, `gpt-4o`, `gpt-4o-mini`, `claude-3-haiku`, etc. — the page shows:
- **Model name and provider**
- **Total input tokens** — the prompts being sent to the model
- **Total output tokens** — the responses being generated
- **Combined total token count**
- **Exact dollar cost** over the last 30 days
- **Cost as a percentage of total AI spend** — highlighting the heaviest contributors

The individual model drill-down page shows:
- **Daily usage trend** — how call volume and cost to this model changes day by day
- **Top users of this model** — which employees or applications are calling it most
- **Input/output ratio** — whether workloads are prompt-heavy or generation-heavy

#### How It Helps the Business
Model selection is the single most impactful cost lever in any AI deployment — and most companies are completely blind to it. Organisations routinely call premium frontier models (`claude-3-5-sonnet`, `gpt-4o`) for tasks that a smaller, faster, and far cheaper model (`claude-haiku`, `gpt-4o-mini`) would handle identically. The cost difference between a premium model and a standard model for the same task can be 10× to 80×. AI Models surfaces this opportunity with real production data. A company spending $8,000/month on AI where 70% of calls go to premium models for simple classification or formatting tasks could reduce that bill to under $3,000 by routing appropriately — without changing any business outcome. TokenLens makes that case with exact numbers rather than estimates.

---

### 7.5 Intelligence — AI ROI
**Status:** 🔜 Coming Soon  |  **Route:** `/roi`

#### What Information Will Be Shown
The AI ROI page will be the most strategically important screen in TokenLens. It will calculate and display:
- **Time saved per developer per week** — estimated based on AI tool usage patterns, suggestion acceptance rates, and task completion speed
- **Engineering output correlated with AI spend** — PRs merged, commits pushed, tickets closed, measured against AI cost during the same period
- **Cost per unit of output** — how much AI spend is required per PR, per feature shipped, per support ticket deflected
- **ROI score per team** — which squads are getting the highest return on their AI investment
- **ROI score per tool** — whether Claude Code, GitHub Copilot, or Cursor is delivering better value for the organisation
- **Trend over time** — whether AI investment ROI is improving or declining as the organisation scales usage
- **Board-ready summary card** — a single-number ROI metric with supporting evidence, exportable for leadership presentations

#### How It Helps the Business
The number one question every CEO and CFO asks about AI tooling is: *"Is the money we are spending actually making our team more productive?"* Today, most companies answer this question with gut feel, anecdote, or cherry-picked case studies. AI ROI will answer it with data. A company that spends $15,000/month on AI tools will be able to show its board: *"That investment reduced time-to-merge by 23%, increased feature throughput by 31%, and saved an estimated 620 developer hours — at a cost of $24 per recovered hour versus a fully-loaded developer cost of $80/hour."* That is the difference between a company that continues investing in AI with confidence and a company that cuts the budget because no one could prove it was working.

---

### 7.6 Intelligence — Suggestions
**Status:** 🔜 Coming Soon  |  **Route:** `/suggestions`

#### What Information Will Be Shown
The Suggestions page will be TokenLens's intelligent advisor — a continuously updated feed of specific, actionable recommendations generated from real usage patterns. Each suggestion card will show:
- **The specific issue identified** — e.g. "14 GitHub Copilot seats have been inactive for over 30 days"
- **The exact financial impact** — e.g. "Releasing these seats would save $266/month"
- **The recommended action** — a clear step to take, with a direct link to the relevant settings or provider admin panel
- **The evidence behind it** — the data points that triggered this suggestion
- **Priority level** — High / Medium / Low based on financial impact
- **Status tracking** — mark suggestions as actioned, dismissed, or in progress

Example suggestions the engine will generate:
- Teams consistently calling `claude-3-5-sonnet` for tasks where `claude-haiku` would suffice — projected monthly saving: $1,200
- 8 Microsoft Copilot licences assigned to employees who have not used the tool in 45 days — projected saving: $240/month
- OpenAI API spend spiked 340% on Tuesday 14th compared to the prior Tuesday — investigate before month-end
- One user account is responsible for 28% of total token consumption — review for automation script misuse

#### How It Helps the Business
Most cost optimisation requires someone to actively go looking for inefficiencies — and in a busy organisation, no one has time to do that. Suggestions flips the model: TokenLens finds the inefficiencies and surfaces them automatically, so the right person can act on them with one click. For a company spending $20,000/month across AI tools, the Suggestions engine will typically identify $3,000–6,000/month in recoverable waste within the first 60 days of use. That alone pays for the TokenLens subscription many times over — and the company gets every other feature for free.

---

### 7.7 Developer AI Tools — Overview
**Status:** ✅ Live  |  **Route:** `/developer-ai-tools`

#### What Information Is Shown
The Developer AI Tools Overview page consolidates all developer-focused AI tool data into a single snapshot. It shows:
- **Total active developers** across all connected dev AI tools
- **Total seats provisioned** (licensed) vs. seats actually in use
- **Combined cost across all dev tools** over the last 30 days
- **Daily activity trend** — a line chart showing developer engagement day by day across all tools
- **Per-tool summary cards** — Claude Code, GitHub Copilot, and Cursor each showing their own active users, cost, and status at a glance

#### How It Helps the Business
Engineering leaders typically manage developer AI tool budgets across two or three separate vendor portals with no consolidated view. This overview gives them a single number to present in a tooling review: total developer AI investment, total active adoption, and combined daily engagement. It immediately highlights the most common problem in developer tooling: high licence counts with low adoption rates. When a company pays for 80 Copilot seats and 50 Cursor seats but only 60 developers are actively using either tool, the overview surfaces that gap before the next renewal discussion.

---

### 7.8 Developer AI Tools — Claude Code
**Status:** ✅ Live  |  **Route:** `/developer-ai-tools/claude-code`

#### What Information Is Shown
The Claude Code page tracks usage of Anthropic's terminal-based AI coding agent per developer. It displays:
- **Active developer count** — how many engineers ran Claude Code sessions this period
- **Total sessions** — number of distinct Claude Code invocations across the organisation
- **Total tokens consumed** — input (prompts sent to Claude) and output (code and responses received)
- **Total cost** for the period
- **Cost per developer** — average AI spend attributable to Claude Code per active user
- **Daily activity trend** — line chart of session count and cost per day
- **Per-developer breakdown table** — each developer with their session count, tokens, and cost
- **Top developers by cost** — ranked list of highest Claude Code consumers

#### How It Helps the Business
Companies that have deployed Claude Code to their engineering team need to know: who is using it, who is not, and what the cost per developer looks like. A company that rolls out Claude Code to 40 developers and finds that only 18 are using it after 60 days has an adoption problem — not a cost problem. The other 22 licences are waste. Equally, if 3 developers account for 60% of total cost, a manager needs to know whether that is high-value deep usage or an automation script running without oversight. The Claude Code page answers both questions with data, enabling targeted developer coaching, licence right-sizing, and informed renewal decisions.

---

### 7.9 Developer AI Tools — GitHub Copilot
**Status:** ✅ Live  |  **Route:** `/developer-ai-tools/github-copilot`

#### What Information Is Shown
The GitHub Copilot page tracks every seat in the organisation's Copilot Business or Enterprise subscription. It shows:
- **Total seats licensed** vs. **active seats** — the most important metric for licence management
- **Idle seats** — specific users assigned a seat but with zero or near-zero activity in the period
- **Daily active users** — how many developers used Copilot on each day over the last 30 days
- **Code suggestion acceptance rate** — the percentage of AI-generated code suggestions that developers accepted vs. dismissed
- **Per-developer engagement table** — every seat holder with their active days, suggestions received, suggestions accepted, and engagement score
- **Adoption trend chart** — whether the percentage of active seats is growing or declining over time

#### How It Helps the Business
GitHub Copilot is billed per seat regardless of whether the seat is used. At $19/user/month for Copilot Business (or $39/user/month for Enterprise), idle seats are pure waste. A company with 100 seats where 25 are dormant is spending $5,700/year on nothing. The GitHub Copilot page makes every idle seat visible, named, and attributable — so IT or engineering operations can reclaim those seats at the next billing cycle. Beyond waste, the acceptance rate metric is a quality signal: if developers in one team accept 35% of suggestions while another team accepts only 8%, it indicates a training gap or a tooling configuration issue that a manager can address. This page transforms Copilot from a licence cost into a managed, measurable productivity programme.

---

### 7.10 Developer AI Tools — Cursor
**Status:** ✅ Live  |  **Route:** `/developer-ai-tools/cursor`

#### What Information Is Shown
The Cursor page tracks usage of the AI-native code editor across the engineering team. It shows:
- **Total licensed seats** vs. **active seat count** in the current period
- **Active user list** — which developers have used Cursor in the last 30 days
- **Inactive seat holders** — developers with a Cursor licence who have not opened the tool
- **Cost per active seat** — the real effective cost per engaged developer, factoring out dormant licences
- **Daily usage trend** — a line chart showing how many developers used Cursor each day
- **Adoption trajectory** — whether adoption is growing, flat, or declining since rollout

#### How It Helps the Business
Cursor is a significant per-seat investment, and it is one of the faster-moving tools in the AI coding assistant space — companies frequently adopt it as a Copilot alternative or complement. The biggest risk after rollout is adoption plateau: the initial wave of enthusiastic adopters uses it heavily, but the second and third tier of developers never meaningfully engages. The Cursor page surfaces this pattern immediately. If adoption is flat at 40% of seats after 90 days, the company knows it needs a developer enablement campaign — not a larger licence count. If adoption is growing steadily toward 80%, it can project when to expand the subscription with confidence.

---

### 7.11 LLM / API Spend — Overview
**Status:** ✅ Live  |  **Route:** `/llm-spend`

#### What Information Is Shown
The LLM/API Spend Overview is the financial control centre for direct AI API consumption. It aggregates data across Anthropic (Claude) and OpenAI into one view showing:
- **Total cost over the last 30 days** — combined across all connected API providers
- **Total tokens consumed** — combined input + output across all providers
- **Active provider count**
- **Top users by cost** — a ranked table of up to 15 individuals whose applications or accounts drove the most API spend, with their provider, token count, and exact cost
- **Daily cost trend** (full-width chart) — a multi-line chart showing Anthropic and OpenAI spend separately, day by day over 30 days — immediately revealing spikes, drops, and seasonal patterns
- **Provider cost comparison bar chart** — side-by-side cost comparison between Claude and OpenAI for the period
- **Model breakdown table** — every model called across all providers with input tokens, output tokens, total tokens, and cost
- **Limited provider cards** — Gemini and Perplexity shown with a clear explanation of why their data is unavailable

#### How It Helps the Business
For companies building AI-powered products, the LLM API bill is often the fastest-growing line item in their infrastructure budget — and the hardest to explain at board level. A $50,000/month API spend with no breakdown is a governance problem. This page solves it. Finance can see exactly which provider is more expensive for which workload. Engineering can see whether a cost spike on a particular day was caused by a specific user's batch job or a product feature that started making more calls. The model breakdown table is particularly powerful: when a company realises that one model accounts for 80% of cost and that model is a premium tier that could be partially replaced with a cheaper one for non-critical paths, the saving is immediate and substantial.

---

### 7.12 LLM / API Spend — Claude (Anthropic)
**Status:** ✅ Live  |  **Route:** `/llm-spend/claude`

#### What Information Is Shown
The Claude provider detail page is a deep-dive into all Anthropic API consumption. It shows:
- **Four top-line stat cards:** Total cost (30d), Total tokens, Input tokens, Active users
- **Token breakdown panel:** Input tokens, Output tokens, Cached tokens (which cost less), and Total cost — shown as large figures for at-a-glance reading
- **Daily cost trend** (full-width line chart) — Claude-specific spend by day over 30 days
- **Cost by model** (bar chart) — cost split across claude-3-5-sonnet, claude-3-haiku, claude-3-opus, and any other Claude models in use
- **Model breakdown table** — every Claude model with input tokens, output tokens, total tokens, and exact cost
- **User breakdown table** — every user/application that called the Anthropic API with their input tokens, output tokens, total tokens, and cost

#### How It Helps the Business
Anthropic is frequently the primary AI provider for companies building with Claude's API. The Claude page gives both engineering and finance a complete picture of where every dollar of that Anthropic bill is going. The cached tokens breakdown is particularly valuable: Anthropic's prompt caching feature significantly reduces costs for applications that repeatedly send the same system prompt, but only if the application is engineered to use it. When the cached token count is low relative to total tokens, it is a direct signal to the engineering team that they are not using caching — and therefore paying more than necessary. TokenLens makes that invisible inefficiency visible.

---

### 7.13 LLM / API Spend — OpenAI
**Status:** ✅ Live  |  **Route:** `/llm-spend/openai`

#### What Information Is Shown
The OpenAI provider detail page mirrors the Claude page with full coverage of all OpenAI API usage. It shows:
- **Total cost, total tokens, input tokens, active users** — four stat cards
- **Token and cost breakdown** — input vs. output token split with exact costs
- **Daily cost trend** (full-width line chart) — OpenAI-specific spend by day over 30 days
- **Cost by model** (bar chart) — spend split across gpt-4o, gpt-4o-mini, gpt-4-turbo, text-embedding models, and any other OpenAI models in use
- **Model breakdown table** — every OpenAI model with token counts and costs
- **User breakdown table** — every account or application calling the OpenAI API with their usage and cost

#### How It Helps the Business
Many companies run both Anthropic and OpenAI APIs simultaneously — different product features on different models, or teams with different preferences. Without a unified view, it is impossible to compare true cost-per-token between providers or make routing decisions based on real data. The OpenAI page gives finance and engineering the same depth of visibility for OpenAI as for Claude, enabling genuine apples-to-apples comparison. When a company sees that a specific workload costs $0.004 per 1,000 tokens on GPT-4o-mini and $0.002 on Claude Haiku, it has the data to make an informed routing decision — without relying on benchmark estimates.

---

### 7.14 LLM / API Spend — Gemini
**Status:** ⚠️ Limited  |  **Route:** `/limitations`

#### Current Situation
Google does not provide a public admin-level API for querying aggregate Gemini usage across an organisation. As a result, TokenLens cannot automatically retrieve token counts, per-user cost data, or model-level breakdowns for Gemini. Manual cost tracking via the Google Cloud Billing console is currently the only option.

#### What This Means for Your Business
If your organisation uses the Gemini API, your Gemini costs will not appear in TokenLens until Google releases an enterprise usage API. The Provider Limits page explains this fully and will be updated the moment a programmatic integration becomes available. Gemini is listed in the sidebar with a clear "Limited" badge so all users understand the constraint without confusion.

---

### 7.15 LLM / API Spend — Perplexity
**Status:** ⚠️ Limited  |  **Route:** `/limitations`

#### Current Situation
Perplexity does not currently expose an admin API for enterprise usage reporting. Aggregate spend and per-user breakdown data cannot be fetched programmatically. This is a provider-side limitation rather than a TokenLens limitation.

#### What This Means for Your Business
Perplexity usage data will not flow into TokenLens automatically. If your organisation uses Perplexity's API, those costs must be tracked manually via Perplexity's billing dashboard until an admin API becomes available. This limitation is documented transparently in the Provider Limits page.

---

### 7.16 Business Productivity AI — Overview
**Status:** ✅ Live  |  **Route:** `/business-productivity-ai`

#### What Information Is Shown
The Business Productivity AI Overview gives a top-level snapshot of all AI tools used by the broader organisation — not just developers, but every employee. It shows:
- **Total licensed seats** across all connected business AI tools
- **Active user count** — employees who have used a business AI tool at least once in the period
- **Adoption rate** — active users as a percentage of licensed seats
- **Total cost for the period**
- **Per-tool summary cards** — each connected business AI tool with its own seat count, active users, and cost

#### How It Helps the Business
Business AI tools like Microsoft 365 Copilot are typically bought in large bulk licence agreements where the price is agreed at the contract level rather than discovered monthly. The critical question is not "how much does it cost?" (that is fixed) but "how many of those licences are actually being used?" A company that has committed to 300 Microsoft Copilot seats at $30/user/month is spending $108,000/year regardless. If only 180 employees are actively using it, they are paying for 120 idle seats — $43,200/year in waste that could have been avoided with earlier visibility. This page surfaces adoption numbers immediately.

---

### 7.17 Business Productivity AI — Microsoft Copilot
**Status:** ✅ Live  |  **Route:** `/business-productivity-ai/microsoft-copilot`

#### What Information Is Shown
The Microsoft Copilot detail page tracks Microsoft 365 Copilot usage across the entire organisation. It shows:
- **Total licensed seats vs. active seats** — the most critical metric for licence right-sizing
- **Idle seat list** — specific employees with a Copilot licence who have not used it in the reporting period
- **Active user count and trend** — daily active users over the last 30 days
- **Per-application usage breakdown** — how Copilot is being used across individual Microsoft 365 apps:
  - **Word** — AI writing, rewriting, and summarisation usage
  - **Excel** — AI formula generation and data analysis usage
  - **PowerPoint** — AI slide generation and design usage
  - **Teams** — meeting summarisation, chat assistance, and action item extraction
  - **Outlook** — AI email drafting, summarisation, and scheduling usage
- **Cost per active user** — the real effective cost per engaged employee, factoring out dormant licences
- **Adoption trend over time** — whether usage is growing, plateauing, or declining since deployment

#### How It Helps the Business
Microsoft 365 Copilot is one of the most expensive AI investments a company can make — and one of the hardest to justify because its value is spread across hundreds of small everyday interactions rather than a single dramatic productivity outcome. The Microsoft Copilot page makes the case for the investment — or against it — with specific data. If Teams meeting summaries are used daily by 180 people but PowerPoint AI is used by only 12, the company knows exactly where Copilot is delivering value and where it needs targeted employee training to unlock adoption. If 60 seats have been idle for three months, IT knows exactly which employees to reach out to before the next licence renewal. If adoption has grown from 45% to 72% over the quarter, leadership has a concrete metric to present to the board as evidence that the deployment is working.

---

### 7.18 Governance — Alerts
**Status:** 🔜 Coming Soon  |  **Route:** `/alerts`

#### What Information Will Be Shown
The Alerts page will allow administrators to create automated monitoring rules and view a history of all triggered alerts. It will show:
- **Active alert rules** — each rule with its condition (e.g. "monthly spend > $5,000"), scope (org, team, user, or provider), and enabled/disabled status
- **Alert history feed** — a chronological list of every triggered alert with severity (low/medium/high/critical), timestamp, the condition that was met, and resolution status
- **Alert severity breakdown** — a summary of how many alerts fired this week vs. last week
- **Rule management** — create, edit, enable, disable, and delete alert rules from a simple form interface

Example rules companies will configure:
- Monthly API spend exceeds $10,000 → notify finance team
- A single user's daily token consumption exceeds 500,000 tokens → notify their manager
- A new AI model appears in usage data that was not in the approved model list → notify IT security
- GitHub Copilot active seat count drops below 70% → notify IT operations
- Anthropic sync fails for more than 24 hours → notify platform team

#### How It Helps the Business
AI costs are unpredictable by nature — a developer running a poorly optimised batch job overnight can generate $2,000 in unexpected API costs before anyone notices. Without automated alerts, the first signal is the invoice at the end of the month. With Alerts, the platform team gets a Slack message at 11pm when the spend spike starts — and can intervene before the job completes. For companies with compliance requirements, alerts on model usage are equally important: the moment an unapproved model appears in production call logs, security is notified automatically rather than discovering it in a quarterly audit three months later.

---

### 7.19 Governance — Notifications
**Status:** 🔜 Coming Soon  |  **Route:** `/notifications`

#### What Information Will Be Shown
The Notifications page will be the delivery configuration hub for all Alerts. It will show:
- **Configured channels list** — every connected delivery channel (email addresses, Slack webhooks, Teams webhooks, custom HTTP webhooks) with its name, type, and current status
- **Channel test tool** — send a test notification to any configured channel to verify it is working
- **Per-channel preferences** — which alert severity levels each channel receives (e.g. Slack channel gets all alerts, email only gets critical)
- **Digest configuration** — option to receive a daily or weekly summary email instead of real-time alerts for lower-priority rules
- **Delivery log** — history of notifications sent, with delivery success or failure status per channel

#### How It Helps the Business
Alert rules are only valuable if the right person is notified in the right place at the right time. A finance manager who monitors email but not Slack will miss a critical spend alert if it is delivered to the wrong channel. Notifications ensures every alert reaches the person who can act on it, through the system they already monitor — whether that is a direct email, a dedicated #ai-spend-alerts Slack channel, a Teams message in the engineering workspace, or a webhook into an existing incident management platform. This is the infrastructure that turns TokenLens from a reporting tool into an active monitoring system.

---

### 7.20 Governance — Reports
**Status:** 🔜 Coming Soon  |  **Route:** `/reports`

#### What Information Will Be Shown
The Reports page will allow any administrator to generate structured, formatted summaries of AI usage on demand or on a schedule. It will offer:
- **Report templates** — pre-built report types: Monthly Cost Summary, Team Efficiency Report, Model Usage Report, Provider Comparison Report, Idle Seat Report
- **Scope filters** — generate for the full organisation or scoped to a specific team, provider, or model
- **Date range selection** — any custom date range or standard presets (last 30 days, last quarter, last 12 months)
- **Export formats** — PDF (formatted for board presentations) and CSV (for further analysis in Excel or finance systems)
- **Scheduled delivery** — configure a report to generate and deliver to an email address automatically on the 1st of each month, or every Monday morning
- **Report history** — archive of all previously generated reports with download links

#### How It Helps the Business
Finance teams require monthly AI cost summaries for budget reconciliation. Board members require quarterly AI investment narratives. Compliance teams require periodic usage reports for audit purposes. Today, someone in the company produces these manually by downloading raw data from multiple portals, cleaning it, and formatting it into a presentation. Reports eliminates that process entirely. The head of finance receives a fully formatted PDF in their inbox on the first of every month — without requesting it, without waiting for someone to produce it, and without any risk of error from manual data compilation.

---

### 7.21 Governance — Audit Logs
**Status:** 🔜 Coming Soon  |  **Route:** `/audit-logs`

#### What Information Will Be Shown
The Audit Logs page will maintain a complete, searchable record of every significant action performed within TokenLens. Each log entry will show:
- **Timestamp** — exact date and time of the action
- **Actor** — which user performed the action (name + email)
- **Action type** — e.g. Connected Provider, Disconnected Provider, Changed Alert Rule, Exported Report, Modified Budget Limit, Viewed User Data
- **Resource affected** — which provider, rule, user, or setting was changed
- **Change details** — the before and after values for configuration changes
- **IP address** — the network address from which the action was performed

Filtering and search will allow sorting by actor, action type, date range, and resource.

#### How It Helps the Business
For companies operating under compliance frameworks — SOC 2 Type II, ISO 27001, GDPR, HIPAA, or internal corporate security policies — an audit trail is not optional. Security auditors ask two questions: "Who had access to sensitive data?" and "What did they do with it?" Without Audit Logs, the answer is a manual investigation across system logs that can take days. With Audit Logs, the answer is a filtered export that takes 30 seconds. Additionally, for organisations managing AI budgets carefully, Audit Logs answers internal accountability questions: when a budget limit was changed or a provider was disconnected, the log shows exactly who made the change and when — eliminating finger-pointing and creating clear operational accountability.

---

### 7.22 Governance — Provider Limits
**Status:** ✅ Live  |  **Route:** `/limitations`

#### What Information Is Shown
The Provider Limits page is a transparent reference document explaining why certain providers cannot be fully integrated into TokenLens. It shows:
- **Which providers have integration limitations** — currently Gemini and Perplexity
- **The specific reason for the limitation** — no public admin API for usage data retrieval
- **What data is unavailable** — token counts, per-user breakdowns, model-level cost data
- **What alternatives exist** — manual tracking via provider-specific consoles
- **What the roadmap looks like** — a note that TokenLens will integrate the moment a provider releases a suitable API

#### How It Helps the Business
Transparency about limitations builds trust. When a company evaluates TokenLens and asks "does it cover Gemini?", the answer is honest rather than misleading: Google does not provide the data, and this page explains that clearly. This is significantly better than the alternative — silently showing zero data for a provider and leaving the user to wonder if their configuration is wrong. It also protects the sales relationship: a prospect who discovers a limitation during the trial on their own terms is far less likely to churn than one who discovers it after signing a contract.

---

### 7.23 Governance — Settings
**Status:** ✅ Live  |  **Route:** `/settings`

#### What Information Is Shown
The Settings page is the configuration and operations centre for the entire TokenLens deployment. It shows:
- **Provider Integration section** — every supported provider in a card with:
  - Current connection status (Connected with green indicator / Not configured / Limited)
  - Last successful sync timestamp and how long ago it occurred
  - For configured providers: a **Sync Now** button to trigger an immediate data pull
  - For unconfigured providers: a **Configure** button opening a secure credential entry form
  - For limited providers (Gemini, Perplexity): a clear explanation and link to Provider Limits
  - For unconfigured providers: the Sync button is visually disabled with an explanatory tooltip
- **Data Sync section** — shows only connectable providers; Gemini and Perplexity are hidden here since they cannot sync
- **Organisation settings** — company name, timezone configuration, monthly budget limit
- **Data retention settings** — how long usage metrics and audit logs are kept before automatic deletion

#### How It Helps the Business
Settings is where a company's relationship with TokenLens becomes real: it is where they enter their API keys and activate live data. The page is designed to make this process trustworthy — every credential is encrypted immediately on submission, the connection is tested before anything is stored, and the status display confirms everything is working. For IT operations teams managing multiple providers, the single-page overview of all connection statuses and last sync times means they do not need to check individual pages to confirm data freshness — one glance at Settings tells them the entire integration health. The disabled sync button for unconfigured providers prevents accidental operations and makes the expected setup sequence clear without needing a manual.

---

## 8. Provider Integration Matrix

| Provider | Category | Auth Method | Data Coverage | Key Capabilities | Status |
|----------|----------|-------------|---------------|-----------------|--------|
| Anthropic (Claude) | LLM API Spend | Admin API Key | Full | Cost, tokens (input/output/cached), models, users, daily trends | Live |
| OpenAI | LLM API Spend | Admin API Key | Full | Cost, tokens, models, users, projects, daily trends | Live |
| Google Gemini | LLM API Spend | Google Cloud | None | — | No Admin API |
| Perplexity | LLM API Spend | API Key | None | — | No Admin API |
| Claude Code | Developer AI | Anthropic Admin API | Full | Developer sessions, tokens, cost per developer, daily activity | Live |
| GitHub Copilot | Developer AI | GitHub App / PAT | Seat-based | Active seats, idle seats, acceptance rates, per-developer usage | Live |
| Cursor | Developer AI | Admin API Key | Partial | Seat usage, active developers, cost per seat, activity trends | Live |
| Microsoft 365 Copilot | Business AI | Microsoft Graph OAuth | Enterprise | Active seats, per-app usage (Word/Excel/Teams/Outlook/PPT), cost per user | Live |

Phase 2A Note: Non-Anthropic providers are currently running on seeded demo data. Real API connectors (Phase 2B) are the next development milestone. Entering real credentials for these providers will activate live data sync when Phase 2B connectors are deployed.

---

## 9. Database Schema

### Phase 1 Tables — Core Anthropic MVP

| Table | Purpose |
|-------|---------|
| User | Platform user: email, bcrypt password hash, name |
| Organization | Company workspace: name, monthlyBudgetUsd, timezone, dataMode (demo/real) |
| OrganizationMember | Many-to-many: User to Organization with role (owner/admin/viewer) |
| Team | Sub-group within an org: name, slug |
| TeamMember | Many-to-many: User to Team |
| ProviderConnection | Encrypted API key + sync state (lastSyncAt, syncStatus, errorMessage) per provider per org |
| UsageDaily | Anthropic daily usage: userEmail, date, inputTokens, outputTokens, cachedTokens, totalCostUsd |
| ModelUsageDaily | Anthropic model-level breakdown: model, date, tokens, cost |
| ClaudeCodeDaily | Claude Code activity: userEmail, date, sessions, commits, PRs, linesOfCode, tokens, cost |
| Budget | Cost limits (daily/weekly/monthly) at org or team scope |
| AlertRule | Threshold rules: metric, operator, threshold value, period |
| Alert | Triggered alert instance: references AlertRule, message, severity, resolvedAt |
| AuditLog | Platform action record: userId, action, resource, timestamp |

### Phase 2 Tables — Multi-Provider

| Table | Purpose |
|-------|---------|
| ProviderSyncRun | Log of every sync attempt: provider, status, recordsSynced, durationMs, errorMessage |
| AiUsageDaily | Generic daily usage for OpenAI, Gemini, Perplexity: provider, userEmail, date, tokens, cost |
| AiModelUsageDaily | Model-level daily usage across all providers |
| DeveloperAiDaily | GitHub Copilot + Cursor activity: provider, userEmail, date, sessions, suggestions, acceptances |
| SeatUsageDaily | Seat utilization: provider, userEmail, date, seatAssigned, seatActive |
| BusinessAiDaily | Microsoft Copilot per-app usage: userEmail, date, appName, activeMinutes |
| ProviderUserMapping | Maps provider-specific user identifiers to TokenLens User records |

### Phase 3 Tables — AI ROI Intelligence

| Table | Purpose |
|-------|---------|
| AiAdoptionScoreDaily | Per-user/team/org AI adoption badge: high/healthy/low/inactive |
| AiWasteScoreDaily | Waste detection: unused seats, low token utilization, idle users |
| TeamEfficiencyScoreDaily | Cost per PR, cost per ticket, commit count, AI-assisted vs total |
| Recommendation | AI-generated suggestions: type, description, projected saving, status |
| GitHubRepository | GitHub repo metadata for PR/commit correlation |
| GitHubPullRequestDaily | Daily PR counts per team for productivity correlation |
| GitHubCommitDaily | Daily commit counts per developer |
| JiraProject | Jira project metadata for ticket throughput correlation |
| JiraIssueDaily | Daily issues completed per team |
| ProductivityCorrelationDaily | AI spend vs. engineering output correlation score per team |
| NotificationChannel | Configured delivery channels: email, Slack, Teams, webhook |
| NotificationDeliveryLog | Record of every notification sent: channel, alert, status, timestamp |
| DataRetentionPolicy | Org-level setting: how long to keep metrics vs. audit logs |

### Key Database Design Principles

- All usage tables have (organizationId, date) composite index for fast time-range queries
- All provider tables have (organizationId, provider, date) index for per-provider filtering
- Upsert semantics — sync workers use upsert not insert because provider APIs return cumulative daily totals that may be re-fetched
- Additive only — Phase 2 and Phase 3 tables never modify Phase 1 tables

---

## 10. API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Email + password login; sets httpOnly JWT cookie |
| POST | /api/auth/logout | Clears session cookie |
| GET | /api/auth/me | Returns current user + organisation context |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/overview | Aggregated totals: cost, tokens, users, teams, top users, budget status |
| GET | /api/dashboard/trends | Daily cost time-series (configurable ?days= param) |
| GET | /api/dashboard/top-models | Top 5 models by cost |

### Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | All org members with 30-day cost, token, dev-AI aggregation |
| GET | /api/teams | All teams with aggregated cost, tokens, sessions |
| GET | /api/models | Model-level cost and token breakdown across all providers |
| GET | /api/intelligence/adoption-scores | AI adoption scores per user/team/org |
| GET | /api/intelligence/waste-scores | Waste scores: idle seats, low utilization |
| GET | /api/intelligence/team-efficiency | Cost per PR, cost per ticket |
| GET | /api/recommendations | AI-generated optimization suggestions |

### Provider Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/llm-spend | Combined Anthropic + OpenAI spend: trends, top users, models |
| GET | /api/llm-spend/claude | Claude-specific: totals, trend, byUser, byModel |
| GET | /api/llm-spend/openai | OpenAI-specific: totals, trend, byUser, byModel |
| GET | /api/claude-code | Claude Code per-developer metrics |
| GET | /api/developer-ai-tools | GitHub Copilot + Cursor aggregated data |
| GET | /api/business-productivity-ai | Microsoft Copilot per-app usage |

### Provider Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/providers | All providers with status, cost, tokens, last sync |
| POST | /api/providers/[key] | Connect a specific provider (encrypt + store credentials) |
| DELETE | /api/providers/[key] | Disconnect a provider |
| GET | /api/provider | Anthropic connection status |
| POST | /api/provider | Connect Anthropic |
| DELETE | /api/provider | Disconnect Anthropic |
| GET | /api/provider/sync | Trigger manual Anthropic sync |
| POST | /api/provider/sync-all | Trigger sync for all connected providers |
| POST | /api/provider/sync-code | Trigger manual Claude Code sync |

### Settings and Governance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Org settings: timezone, budget, data retention |
| POST | /api/settings/organization | Update org name, budget, timezone |
| POST | /api/settings/budget | Create or update spend limits at org or team scope |
| GET | /api/alerts | All alert rules and recent triggered alerts |
| PUT | /api/settings/alert-rules | Create or update alert rules (bulk) |
| GET | /api/notifications/channels | Configured notification channels |
| POST | /api/notifications/channels | Add a notification channel |
| POST | /api/notifications/test | Send a test notification to a channel |
| GET | /api/data-retention | Current data retention policy |
| POST | /api/data-retention | Update retention policy |

---

## 11. Data Sync Architecture

### How Sync Workers Operate

Every provider has a dedicated sync worker file in workers/. The pattern is identical across all providers:

1. Load ProviderConnection from DB for this org + provider
2. Decrypt encryptedApiKey using AES-256-GCM
3. Initialise provider API client with decrypted key
4. Fetch usage data for the target date range (default: last 7 days)
5. For each daily record returned: look up or auto-create the User record, then UPSERT into the relevant daily table (idempotent)
6. Update ProviderConnection: set lastSyncAt = now, syncStatus = connected, errorMessage = null
7. Log sync run to ProviderSyncRun table

If any step fails: set syncStatus = error, set errorMessage = error details, log failed run to ProviderSyncRun, surface error in Settings page provider row.

### Sync Workers

| Worker | Provider | Data Written To |
|--------|----------|----------------|
| sync-claude-usage.worker.ts | Anthropic | UsageDaily, ModelUsageDaily |
| sync-claude-code.worker.ts | Claude Code | ClaudeCodeDaily |
| sync-openai.worker.ts | OpenAI | AiUsageDaily, AiModelUsageDaily |
| sync-github-copilot.worker.ts | GitHub Copilot | DeveloperAiDaily, SeatUsageDaily |
| sync-cursor.worker.ts | Cursor | DeveloperAiDaily, SeatUsageDaily |
| sync-microsoft-copilot.worker.ts | Microsoft Copilot | BusinessAiDaily, SeatUsageDaily |
| alert-checker.worker.ts | — | Alert (evaluates AlertRules) |

### Upsert vs Insert

Sync workers always use upsert (not insert). This is because provider APIs often return daily aggregates that change throughout the day, re-syncing the same date should update the record not duplicate it, and network failures may cause a partial sync to be re-run.

---

## 12. Product Roadmap

### Phase 1 — Complete — Anthropic MVP

- Single-org SaaS platform
- Email/password auth with JWT sessions
- Anthropic API key connection + real-time sync
- Claude Code developer activity tracking
- AI Users, AI Teams, AI Models analytics
- Alert rules + threshold monitoring
- Budget tracking
- Audit logging
- Settings + provider management

### Phase 2A — Complete — Multi-Provider Foundation

- Provider registry with 8 providers defined
- Demo data seeded for all non-Anthropic providers
- OpenAI, GitHub Copilot, Cursor, Microsoft Copilot pages live with demo data
- New DB tables (additive) for all provider types
- Connector interface + stub connectors for all providers
- LLM/API Spend, Developer AI Tools, Business Productivity AI section structure
- Sidebar fully updated with new navigation hierarchy
- Gemini and Perplexity marked as Limited (no admin API)

### Phase 2B — In Progress — Real Provider Connectors

- OpenAI Admin API real connector
- GitHub Copilot Business/Enterprise API real connector
- Cursor admin API real connector
- Microsoft Graph OAuth real connector
- Automatic user mapping across providers
- Real data replaces demo data when provider is connected

### Phase 3 — Planned — AI ROI Intelligence Layer

- AI adoption scoring per user, team, and org
- AI waste detection: idle seats, low-utilization users, over-provisioned models
- Team efficiency scoring: cost per PR, cost per ticket
- GitHub integration for PR and commit data
- Jira integration for issue throughput data
- Productivity correlation: AI spend vs. engineering output
- AI ROI page with investment justification metrics
- Suggestions engine with projected savings and action paths
- Notifications delivery layer: email, Slack, webhooks
- Scheduled reports with PDF and CSV export
- Full audit log UI with search and filters

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Dashboard pages | 26 routes |
| API endpoints | ~40 |
| Providers tracked | 8 |
| Providers live (real data) | 2 (Anthropic + OpenAI) |
| DB tables Phase 1 | 13 |
| DB tables Phase 2 | 7 |
| DB tables Phase 3 | 13 |
| Languages supported | 3 (EN, ES, FR) |
| Features live | 15 |
| Features coming soon | 6 |
| Providers limited (no admin API) | 2 (Gemini, Perplexity) |

---

*TokenLens — Track token usage, costs & productivity across all your AI tools.*
*Version 3.1.0 · Production*
