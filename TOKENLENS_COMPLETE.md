
# TokenLens — Complete Product Document
### For Brainstorming, Strategy & Ideation

> This document contains everything about the TokenLens product — its vision, market, features, architecture, roadmap, and open opportunities. Use it as a complete reference for brainstorming new features, business models, go-to-market strategies, pricing, and product direction.

---

## Part 1: The Big Picture

### What Is TokenLens?

TokenLens is a **B2B SaaS Intelligence Dashboard** that helps companies understand, control, and optimise how their employees use AI tools. It sits on top of all the AI platforms a company subscribes to — LLM APIs like Claude and OpenAI, developer coding assistants like GitHub Copilot and Cursor, and business productivity tools like Microsoft 365 Copilot — and pulls all usage data, cost data, and productivity metrics into one unified dashboard.

Think of it as **Google Analytics, but for AI tool usage across an enterprise**.

### The Core Problem

In 2024–2026, companies are buying AI tools at an unprecedented pace. A typical 200-person tech company today might be paying for:

- Anthropic API for their product ($8,000/month)
- OpenAI API for another product ($5,000/month)
- GitHub Copilot for 80 developers ($1,520/month)
- Cursor for 40 developers ($800/month)
- Microsoft 365 Copilot for 150 employees ($4,500/month)
- Claude Code for 30 senior engineers ($600/month)

**Total: ~$20,420/month = $245,040/year**

And yet:
- The CFO cannot see a single unified cost breakdown
- The CTO does not know which tools are actually being used
- Engineering managers do not know which developers are getting value
- No one knows how many seats are idle
- No one knows if switching models could cut the API bill by 40%
- The board asks "is our AI investment paying off?" and no one has a data-driven answer

TokenLens solves every one of these problems.

### The One-Line Pitch

> *TokenLens gives companies complete visibility and control over their AI spend — so they can stop wasting money, prove ROI, and make every AI dollar count.*

### What Makes It Different

1. **Multi-provider** — covers every major AI category in one place (LLM APIs + Dev Tools + Business AI)
2. **Seat-level granularity** — not just total cost, but cost per person, per team, per model
3. **Idle seat detection** — automatically finds licences being paid for but not used
4. **Model intelligence** — shows where premium models are being over-used vs. where cheaper models would do the same job
5. **Roadmap includes ROI** — going beyond cost to measure productivity gains vs. investment

---

## Part 2: Market & Customers

### Primary Target Customer

**Company profile:**
- 50–2,000 employees
- Technology company or technology-enabled business
- Already paying for 2+ AI tools
- Has an engineering team using developer AI tools
- Has a finance or operations function that manages software budgets

**Key buying personas:**

| Persona | Pain Point | What They Want From TokenLens |
|---------|-----------|-------------------------------|
| **CTO / VP Engineering** | "I have no idea what we're spending on AI or if it's working" | Single dashboard across all AI tools, cost trend visibility |
| **CFO / Finance Director** | "AI is our fastest-growing cost line and I can't explain it to the board" | Cost attribution by team/provider, budget alerts, monthly reports |
| **Engineering Manager** | "I don't know which of my developers are using Copilot and which aren't" | Per-developer adoption metrics, idle seat identification |
| **IT Operations / Procurement** | "I manage 8 different AI tool subscriptions with no central view" | Provider connection hub, licence right-sizing data |
| **Compliance / Security** | "I need an audit trail of who accessed what AI data" | Audit logs, data retention policies, encrypted credentials |

### Secondary Markets

1. **AI consultancies and agencies** — companies that manage AI deployments for their clients could use TokenLens as a white-label reporting tool
2. **Managed Service Providers (MSPs)** — IT service companies managing AI stacks for SMBs
3. **Enterprise IT departments** — large companies with 5,000+ employees and complex multi-department AI deployments
4. **AI-native startups** — companies where 100% of the team uses AI tools daily and cost control is critical from day one

### Market Size

- GitHub Copilot alone has 1.8 million paid users (as of 2024)
- Microsoft 365 Copilot had 400,000 enterprise users at $30/month within 6 months of launch
- OpenAI has 1 million+ paying API customers
- The AI developer tools market is projected to reach $28.7B by 2028
- Every company with 10+ developers and an AI tool subscription is a potential TokenLens customer

### Competitive Landscape

No direct competitor currently covers all three AI categories (LLM API + Developer AI + Business AI) in one dashboard. The closest alternatives:

| Competitor | What They Do | Gap TokenLens Fills |
|-----------|-------------|---------------------|
| **Helicone** | Observability for LLM API calls (prompt logs, latency) | Only covers LLM APIs, focused on technical debugging not business cost |
| **LangSmith** | LLM evaluation and tracing | Development-focused, not cost management |
| **OpenCost** | Cloud cost visibility | Does not cover AI-specific tools or per-user attribution |
| **Zylo / Torii** | SaaS spend management | Covers licences broadly but has no AI-specific intelligence layer |
| **GitHub Copilot Metrics** | Built-in Copilot analytics | Only covers one tool, no cross-tool comparison |
| **Microsoft Viva Insights** | Microsoft 365 productivity | Only Microsoft stack, no developer AI or API spend |

**TokenLens's whitespace:** The complete, cross-category AI intelligence layer that none of these tools provide.

---

## Part 3: The Product — Full Feature Detail

### Module 1: Dashboard

**What it is:** The landing page after login. Shows every connected AI provider grouped by category with status, cost, token usage, and active users.

**Key data shown:**
- Total providers tracked
- Live connection count
- Total AI spend (last 30 days)
- Total tokens consumed (last 30 days)
- Per-provider cards: connection status, 30-day cost, token volume, active users/seats
- Grouped by: LLM/API Spend Providers | Developer AI Tools | Business Productivity AI

**Value:** Gives any leader a complete AI estate overview in under 5 seconds without logging into multiple vendor portals.

---

### Module 2: AI Users

**What it is:** Person-level analytics across all AI providers. Every employee who consumes AI tokens or seats is listed with their cost, usage, and trends.

**Key data shown:**
- User name, email, team
- Total cost attributed (30 days)
- Total tokens consumed (input + output)
- Providers they are active on
- 30-day usage trend (rising/falling)
- Drill-down: input vs. output ratio, top models used, daily cost chart, team membership

**Value:**
- Identifies highest-cost individuals
- Detects runaway automation scripts (sudden usage spikes)
- Enables cost chargeback to individuals or teams
- Surfaces which employees are genuinely getting value vs. not engaging

---

### Module 3: AI Teams

**What it is:** Team-level aggregation of all AI usage. Shows cost, token consumption, and productivity metrics per squad or department.

**Key data shown:**
- Team name, member count
- Total AI cost (30 days)
- Total tokens
- Cost per member average
- Usage trend
- Drill-down: all members with individual rows, team-level daily trend, provider breakdown

**Value:**
- Enables departmental cost attribution and chargeback models
- Allows managers to benchmark team AI engagement
- Identifies high-spend teams vs. low-adoption teams
- Supports quarterly AI budget reviews by business unit

---

### Module 4: AI Models

**What it is:** Cross-provider breakdown of every AI model being called. Shows which models cost what, and who is using them.

**Key data shown:**
- Model name (claude-3-5-sonnet, gpt-4o, gpt-4o-mini, claude-haiku, etc.)
- Provider
- Input tokens, output tokens, total tokens
- Exact dollar cost
- Cost as % of total AI spend
- Drill-down: daily usage trend, top users of this model, input/output ratio

**Value:**
- The single most impactful cost optimisation lever available
- Reveals over-provisioning: teams calling $15/M-token models for tasks a $0.15/M-token model handles identically
- Enables engineering managers to set model routing policies based on real data
- Can reduce API spend by 40–80% with no loss in output quality

---

### Module 5: AI ROI *(Coming Soon)*

**What it is:** Investment return analysis. Compares AI tool cost against measurable productivity output.

**Planned data shown:**
- Time saved per developer per week (estimated from usage patterns)
- Features shipped correlated with AI spend
- Cost per PR merged, cost per ticket closed
- ROI score per team (highest vs. lowest return)
- ROI score per tool (which tool delivers best value for money)
- Board-ready summary: "We spent $X and recovered Y developer hours"

**Value:**
- Answers the #1 board question about AI: "Is this investment working?"
- Provides data for renewing or cutting AI tool contracts
- Enables comparison: "Claude Code gives us 3× ROI vs. GitHub Copilot for our team"
- Creates internal business case for expanding AI tooling

---

### Module 6: Suggestions *(Coming Soon)*

**What it is:** Automated, AI-powered recommendations to reduce waste and improve outcomes. Surfaces specific, actionable insights from usage patterns.

**Planned suggestion types:**
- "14 GitHub Copilot seats inactive for 30+ days — save $266/month by releasing them"
- "Engineering team uses claude-3-5-sonnet for classification tasks where claude-haiku would suffice — save $1,200/month"
- "OpenAI spend spiked 340% on Tuesday vs. prior week — investigate before month-end"
- "One user account generates 28% of total tokens — possible automation script misuse"
- "Microsoft Copilot adoption is 42% after 60 days — schedule enablement training"

**Value:**
- Turns passive monitoring into active cost recovery
- Eliminates the need for anyone to manually hunt for inefficiencies
- For a company spending $20K/month, typically identifies $3K–6K/month in recoverable waste
- Pays for the TokenLens subscription many times over

---

### Module 7: Developer AI Tools Overview

**What it is:** Consolidated snapshot of all developer-specific AI tools. The starting point before drilling into Claude Code, GitHub Copilot, or Cursor.

**Key data shown:**
- Total active developers across all tools
- Total provisioned seats
- Combined cost (30 days)
- Daily activity trend across all tools
- Per-tool summary cards

**Value:** Gives engineering managers a single view of developer AI investment and overall adoption before their weekly standup.

---

### Module 8: Claude Code

**What it is:** Tracks Anthropic's terminal-based AI coding agent (Claude Code) per developer.

**Key data shown:**
- Active developer count
- Total sessions run
- Input tokens (prompts sent), output tokens (code received)
- Cost per developer
- Daily activity trend
- Per-developer breakdown table with sessions, tokens, cost

**Value:**
- Measures adoption post-rollout — who is using it vs. who is not
- Identifies developers who may need onboarding support
- Detects over-use by automated scripts vs. legitimate interactive use
- Provides per-developer ROI evidence for licence renewal

---

### Module 9: GitHub Copilot

**What it is:** Tracks GitHub Copilot seat usage across the engineering organisation.

**Key data shown:**
- Total licensed seats vs. active seats
- Idle seats (licensed but unused) — with named individuals
- Daily active users
- Code suggestion acceptance rate
- Per-developer engagement score

**Value:**
- Idle seat detection is the core value: a 100-seat org with 25 dormant seats at $19/seat/month = $5,700/year waste
- Acceptance rate is a quality signal: low rates indicate misconfiguration or need for training
- Enables evidence-based renewal decisions (expand vs. cut)

---

### Module 10: Cursor

**What it is:** Tracks Cursor (AI-native code editor) seat allocations and usage.

**Key data shown:**
- Licensed seats vs. active seats
- Inactive seat holders (by name)
- Cost per active seat (effective rate after removing idle seats)
- Daily usage trend
- Adoption trajectory over time

**Value:**
- Like Copilot, idle seat waste is the primary value driver
- Adoption trajectory helps predict whether to expand or cancel at renewal
- Enables cross-tool comparison: "Is our team getting more value from Cursor or Copilot?"

---

### Module 11: LLM/API Spend Overview

**What it is:** Financial control centre for all direct LLM API consumption. Aggregates Anthropic and OpenAI in one view.

**Key data shown:**
- Total cost (30 days) across all API providers
- Total tokens (combined)
- Full-width daily cost trend chart (multi-line, one per provider)
- Provider cost comparison bar chart
- Top 15 users by cost
- Complete model breakdown table

**Value:**
- The single most important view for CTOs and CFOs before any budget meeting
- Reveals cost spikes immediately through trend chart
- Model breakdown enables targeted cost reduction
- Top users table enables cost accountability

---

### Module 12: Claude (Anthropic) Detail

**What it is:** Deep-dive into all Anthropic Claude API usage.

**Key data shown:**
- Input tokens, output tokens, cached tokens (3-way split)
- Daily cost trend
- Cost by model (bar chart)
- Model breakdown table
- User breakdown table

**Unique insight — Cached Tokens:**
Anthropic offers prompt caching that significantly reduces cost for applications sending the same system prompt repeatedly. If cached token count is low relative to total tokens, the application is not using caching and paying 2–5× more than necessary. TokenLens surfaces this.

---

### Module 13: OpenAI Detail

**What it is:** Deep-dive into all OpenAI API usage. Mirrors the Claude page.

**Key data shown:**
- Token breakdown (input vs. output)
- Daily cost trend
- Model comparison (gpt-4o vs. gpt-4o-mini vs. gpt-4-turbo, etc.)
- Top users by cost

**Value:** Enables direct cost-per-token comparison between Anthropic and OpenAI — informing model routing decisions based on real production data rather than benchmark estimates.

---

### Module 14: Gemini & Perplexity *(Limited)*

Google Gemini and Perplexity do not provide admin-level APIs for querying aggregate usage. TokenLens cannot pull their data automatically. These providers are shown in the sidebar with a "Limited" badge and link to the Provider Limits explanation page.

**Future opportunity:** Monitor Google Cloud for a Gemini admin API release. Perplexity is growing enterprise traction — an admin API is likely in their roadmap.

---

### Module 15: Business Productivity AI Overview

**What it is:** Top-level view of AI tools used by the broader organisation (not just developers).

**Key data shown:**
- Total licensed seats across all business AI tools
- Active users
- Adoption rate (active/licensed)
- Total cost

**Value:** Answers "are our company-wide AI licences actually being adopted?" at a glance.

---

### Module 16: Microsoft Copilot

**What it is:** Tracks Microsoft 365 Copilot across the entire organisation.

**Key data shown:**
- Licensed seats vs. active seats
- Idle seat holders (by name)
- Per-app usage: Word, Excel, PowerPoint, Teams, Outlook
- Daily active users trend
- Cost per active user (effective rate)
- Adoption trajectory

**Why this matters commercially:**
Microsoft 365 Copilot costs $30/user/month. A company with 200 licences pays $72,000/year. If 60 seats are idle, that's $21,600/year in waste. TokenLens shows exactly which 60 employees are idle — by name — so IT can reclaim those seats at renewal.

The per-app breakdown is also powerful: if Teams meeting summaries are used daily but PowerPoint AI is barely touched, the company knows where to focus enablement training to increase adoption.

---

### Module 17: Alerts *(Coming Soon)*

**What it is:** Automated threshold monitoring with configurable rules.

**Planned features:**
- Rule builder: metric + operator + threshold + scope (org/team/user/provider)
- Alert history feed with severity levels
- Example rules:
  - Monthly API spend > $10,000 → notify finance
  - Single user daily tokens > 500,000 → notify manager
  - New unapproved model appears in usage → notify IT security
  - Copilot active seats drop below 70% → notify IT ops
  - Anthropic sync fails > 24h → notify platform team

**Value:** Turns TokenLens from a passive reporting tool into an active monitoring system. Prevents end-of-month surprises from unexpected cost spikes.

---

### Module 18: Notifications *(Coming Soon)*

**What it is:** Delivery layer for all Alerts.

**Planned channels:**
- Email (individual addresses)
- Slack (webhook URLs)
- Microsoft Teams (webhook URLs)
- Custom HTTP webhook (for PagerDuty, Opsgenie, custom systems)

**Planned settings:**
- Per-channel severity filter (e.g. Slack gets all, email gets only critical)
- Real-time vs. daily digest options
- Test notification button per channel

---

### Module 19: Reports *(Coming Soon)*

**What it is:** Structured report generation on demand or on schedule.

**Planned report types:**
- Monthly Cost Summary (org-wide)
- Team Efficiency Report (cost per team, cost per developer)
- Model Usage Report (which models, what cost)
- Provider Comparison Report (side-by-side provider cost)
- Idle Seat Report (all inactive licences across all providers)

**Export formats:** PDF (formatted for presentations) and CSV (for Excel/finance systems)

**Scheduled delivery:** Automatically email reports to configured addresses on recurring schedules (e.g. every 1st of the month)

---

### Module 20: Audit Logs *(Coming Soon)*

**What it is:** Full, searchable record of every action within TokenLens.

**Logged events:**
- Provider connected / disconnected (who, when)
- Alert rule created / modified / deleted
- Budget limit changed
- Report exported
- User data viewed
- Sync triggered
- Settings modified

**Value:** Required for SOC 2, ISO 27001, GDPR, and internal security policies. Answers "who touched what and when" without a manual investigation.

---

### Module 21: Provider Limits

**What it is:** A transparency page explaining which providers have integration limitations and why.

**Currently covered:** Gemini (no Google admin API), Perplexity (no admin API)

**Value:** Honesty builds trust. Customers who understand limitations during evaluation are less likely to churn after signing. Also serves as a roadmap signal — when these APIs become available, TokenLens is first to integrate.

---

### Module 22: Settings

**What it is:** Central configuration hub for all provider integrations.

**Key features:**
- Connect any provider by entering API key / OAuth token
- All credentials encrypted at rest with AES-256-GCM before storage
- Test connection before saving
- Last sync timestamp per provider
- Manual "Sync Now" button
- Provider status at a glance (connected / error / not configured)
- Unconfigured providers dimmed with sync button disabled
- Monthly budget limit configuration
- Timezone settings
- Data retention policy settings

---

## Part 4: Technical Architecture

### Stack Summary

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Frontend | React 19, Tailwind CSS v4, shadcn/ui |
| Charts | Recharts |
| Database | PostgreSQL (Neon cloud or self-hosted) |
| ORM | Prisma 5 |
| Auth | JWT in httpOnly cookies (7-day), bcrypt |
| Encryption | AES-256-GCM for API keys |
| Fonts | Plus Jakarta Sans + JetBrains Mono |

### Key Architecture Decisions

**Multi-tenant by design:** Every database query is scoped by `organizationId`. One database, multiple organisations, complete data isolation.

**Provider connector pattern:** Providers are defined in a registry with typed capabilities. Each has a connector interface (testConnection, syncUsage, syncSeats). Real connectors exist for Anthropic. Stubs exist for all others, ready for Phase 2B.

**Credential security:** Provider API keys are never stored in plaintext. They are encrypted with AES-256-GCM the moment they are submitted, and decrypted only inside sync workers at the moment of API call — never logged, never returned to the client.

**No content storage:** TokenLens never stores prompts, code, AI responses, or any payload content. Metadata only: token counts, costs, model names, timestamps, user emails.

**Demo vs. Real data mode:** Each organisation has a `dataMode` field. In demo mode, all data comes from seeded records. In real mode, live data flows from connected provider APIs.

**Sync workers:** Each provider has a dedicated sync worker. Workers follow the same pattern: decrypt key → initialise API client → fetch last 7 days → upsert daily records (idempotent) → mark sync success or failure.

### Database Schema Overview

The database has 30 tables across three phases:

**Phase 1 (Core):** User, Organization, OrganizationMember, Team, TeamMember, ProviderConnection, UsageDaily, ModelUsageDaily, ClaudeCodeDaily, Budget, AlertRule, Alert, AuditLog

**Phase 2 (Multi-Provider):** ProviderSyncRun, AiUsageDaily, AiModelUsageDaily, DeveloperAiDaily, SeatUsageDaily, BusinessAiDaily, ProviderUserMapping

**Phase 3 (AI ROI):** AiAdoptionScoreDaily, AiWasteScoreDaily, TeamEfficiencyScoreDaily, Recommendation, GitHubRepository, GitHubPullRequestDaily, GitHubCommitDaily, JiraProject, JiraIssueDaily, ProductivityCorrelationDaily, NotificationChannel, NotificationDeliveryLog, DataRetentionPolicy

### The 8 AI Providers

| Provider | Category | Real Data? | Auth Method |
|----------|----------|-----------|-------------|
| Anthropic (Claude API) | LLM API Spend | Yes — Phase 1 | Admin API Key |
| OpenAI | LLM API Spend | Phase 2B | Admin API Key |
| Google Gemini | LLM API Spend | Limited — no admin API | — |
| Perplexity | LLM API Spend | Limited — no admin API | — |
| Claude Code | Developer AI | Yes — Phase 1 | Anthropic Admin API |
| GitHub Copilot | Developer AI | Phase 2B | GitHub App / PAT |
| Cursor | Developer AI | Phase 2B | Admin API Key |
| Microsoft 365 Copilot | Business AI | Phase 2B | Microsoft Graph OAuth |

---

## Part 5: Business Model

### Current Model (Hypothesis)

TokenLens is a B2B SaaS product. The natural pricing model:

**Per-seat SaaS (per admin user):**
- Starter: $X/month — up to 2 admin users, 3 providers
- Growth: $Y/month — up to 10 admin users, all providers, alerts
- Enterprise: Custom — unlimited admins, SSO, audit logs, custom reports, SLA

**Or: Per-provider-monitored:**
- Base: $X/month
- +$Y/month per provider integrated
- Aligns pricing to the value delivered (more providers = more value)

**Or: Percentage of spend monitored:**
- 0.5–1% of total AI spend under management
- Self-justifying: if TokenLens finds 10% waste in a $50K/month AI budget, that's $5,000/month in savings vs. a $500/month subscription
- Similar to how cloud cost management tools (CloudHealth, Spot.io) are often priced

### Value Proposition for Pricing

The ROI case is immediate and concrete:
- A 200-person company spending $20K/month on AI tools typically has 15–25% in recoverable waste from idle seats and over-provisioned models
- That is $3,000–5,000/month = $36,000–60,000/year in savings
- A TokenLens subscription at $500–1,500/month pays for itself within 30 days

---

## Part 6: Development Roadmap

### Phase 1 ✅ Complete — Anthropic MVP
- Single-org dashboard
- Anthropic API real-time sync
- Claude Code developer tracking
- AI Users, Teams, Models analytics
- Alert rules and budget tracking
- Settings and provider management

### Phase 2A ✅ Complete — Multi-Provider UI
- All 8 provider pages live with demo data
- Developer AI Tools section (Claude Code, GitHub Copilot, Cursor)
- LLM/API Spend section (Claude, OpenAI, Gemini Limited, Perplexity Limited)
- Business Productivity AI section (Microsoft Copilot)
- New navigation structure with renamed URLs
- Language support (EN/ES/FR)

### Phase 2B 🔜 Next — Real Connectors
- OpenAI Admin API connector (real data)
- GitHub Copilot API connector (real data)
- Cursor Admin API connector (real data)
- Microsoft Graph OAuth connector (real data)
- User identity mapping across providers

### Phase 3 🔜 Planned — AI ROI Intelligence
- AI adoption scoring per user/team/org
- Waste detection (idle seats, over-provisioned models)
- Team efficiency scoring (cost per PR, cost per ticket)
- GitHub integration for engineering output metrics
- Jira integration for ticket throughput metrics
- Productivity correlation: AI spend vs. engineering output
- AI ROI page with board-ready metrics
- Suggestions engine with projected savings
- Full Alerts + Notifications + Reports + Audit Logs UI
- Scheduled report delivery (PDF/CSV)

### Phase 4 (Hypothetical Future)
- **Multi-org / MSP mode** — manage multiple client orgs from one login
- **Budget enforcement** — automatically pause or throttle API usage when spend limit is reached
- **Model recommendation engine** — AI suggests which model to use for which task type based on historical quality vs. cost data
- **Team benchmarking** — compare AI adoption and productivity across similar companies (anonymised)
- **Procurement integration** — connect to Salesforce, Coupa, or similar to automate renewal recommendations
- **Slack/Teams bot** — weekly AI spend digest delivered directly in collaboration tools
- **API** — allow customers to pull TokenLens data into their own BI tools (Tableau, Power BI, Looker)

---

## Part 7: Design & UX

### Design Philosophy

TokenLens follows the **Linear / Vercel / Stripe** aesthetic — the gold standard for B2B SaaS dashboards that engineers and technical leaders find trustworthy and premium.

Key principles:
- **Dark by default** — technical audience prefers dark mode; conveys sophistication
- **Data density without clutter** — show a lot of information without overwhelming
- **Monospaced numbers** — all costs, tokens, and counts use JetBrains Mono for precision and alignment
- **Consistent emerald/cyan accent** — single brand colour system, never purple
- **Progressive disclosure** — overview → category → provider → individual user (drill-down pattern)

### Internationalisation

Currently supports: English (EN), Spanish (ES), French (FR).
Translations cover all navigation, dashboard content, and form labels.

---

## Part 8: Strengths, Gaps & Opportunities

### Current Strengths

1. **Full-stack architecture** — auth, encryption, multi-tenant DB, and UI all working together
2. **Multi-category coverage** — only product that spans LLM APIs + Dev Tools + Business AI
3. **Real Anthropic data** — not just a prototype; real sync is working with production API
4. **Extensible provider system** — adding a new provider is a defined pattern, not a one-off build
5. **Demo mode** — can be shown to prospects immediately without requiring their API keys
6. **Clean design** — premium aesthetic that matches how the target market (tech companies) expects B2B SaaS to look

### Current Gaps

1. **Only Anthropic has real data** — all other providers show demo data until Phase 2B connectors are built
2. **No real alerting delivery** — alerts can be created but notifications (email, Slack) are not wired up yet
3. **No reports export** — reports page is Coming Soon
4. **No multi-org support** — each organisation is isolated; no MSP/agency mode
5. **No mobile view** — designed for desktop/laptop screens
6. **No public API** — customers cannot pull TokenLens data into their own BI tools
7. **Gemini and Perplexity are blocked** — Google and Perplexity have no admin API yet

### Open Opportunities for Brainstorming

These are areas where TokenLens could expand or evolve:

**Product Extensions:**
- Anomaly detection with ML (not just rule-based alerts)
- Natural language querying: "Show me which team spent the most on AI last quarter"
- Browser extension that tracks AI tool usage at the browser level (for tools without admin APIs)
- VS Code / JetBrains plugin for granular Claude Code + Copilot session tracking

**Business Model:**
- Freemium tier: connect one provider free, pay for multi-provider
- Usage-based: charge % of AI spend monitored (aligns incentives)
- White-label: sell to AI consultancies who want to report to their clients
- Marketplace: allow third-party connectors built by the community

**Market Expansion:**
- Healthcare AI tracking (HIPAA-compliant variant)
- Government / public sector variant (FedRAMP)
- Education sector (universities deploying AI tools for faculty and students)
- Financial services (strict audit and compliance requirements)

**Integration Ideas:**
- Slack bot for weekly AI spend digest
- Jira plugin showing AI spend per epic or sprint
- GitHub Action that annotates PRs with estimated AI cost
- Zapier / Make connector for custom automation
- HRIS integration (Workday, BambooHR) for automatic team hierarchy sync

**Data & Intelligence:**
- Industry benchmarking: "Your AI spend per developer is 23% above the industry median for your company size"
- Predictive spend forecasting: "Based on current growth, your AI bill will be $X next quarter"
- Model quality scoring: correlate model cost with output quality metrics
- Carbon footprint tracking: AI inference has an energy cost; sustainability reporting is increasingly required

---

## Part 9: Key Numbers (Quick Reference)

| Metric | Value |
|--------|-------|
| Total dashboard routes | 26 |
| Total API endpoints | ~40 |
| Providers tracked | 8 |
| Providers with real data today | 2 (Anthropic + Claude Code) |
| Database tables | 30 (across 3 phases) |
| Languages supported | 3 (EN, ES, FR) |
| Live features | 15 |
| Coming Soon features | 6 |
| Limited providers | 2 (Gemini, Perplexity) |
| Demo login | admin@tokenlens.ai / admin123 |

---

## Part 10: Questions for Brainstorming

Use these to explore the product's potential with an AI assistant:

1. What additional AI providers should TokenLens support and why?
2. How should TokenLens be priced to maximise revenue and minimise churn?
3. What is the fastest path to first paying customer?
4. Should TokenLens go after SMB (50–200 employees) or Enterprise (500+) first?
5. What would a freemium model look like for TokenLens?
6. How can the Suggestions engine be made compelling enough to justify the price alone?
7. What integrations would make TokenLens indispensable to a CTO?
8. How could TokenLens monetise through data (anonymised benchmarking, market insights)?
9. What would a Series A investor want to see in the TokenLens metrics?
10. How could TokenLens position against Microsoft's own Copilot Analytics features?
11. What would a white-label / OEM version of TokenLens look like for AI tool vendors?
12. How should the AI ROI module be designed to be genuinely defensible and trusted by boards?
13. What compliance certifications (SOC 2, ISO 27001) would enterprise customers require?
14. How could TokenLens use its own AI (Claude API calls) to generate better insights?
15. What does the 3-year vision for TokenLens look like if it succeeds?

---

*TokenLens — Complete Product Document*
*Version 3.1.0 · Phase 2A Complete · May 2026*
*For brainstorming, strategy, and ideation use only*
