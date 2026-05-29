# TokenLens — Product Feature Summary

> **TokenLens** is an AI Usage, Token Cost & Productivity Intelligence Dashboard that gives organisations complete visibility into how their teams use AI tools — from LLM API spend to developer coding assistants and business productivity applications — all in one unified platform.

---

## What TokenLens Does

Most organisations today are running multiple AI tools simultaneously — developers using Claude Code and GitHub Copilot, teams using OpenAI or Anthropic APIs for products, and employees using Microsoft Copilot for daily work. Without a central intelligence layer, finance cannot see where money is going, engineering managers cannot compare productivity, and leadership cannot justify or optimise AI spend.

TokenLens solves this. It connects to your AI provider admin APIs, pulls real usage data, and presents it in a single dashboard so you can see who is using what, how much it costs, and whether the investment is paying off.

---

## Feature Modules

---

### 1. Dashboard
**Status:** ✅ Live

The Dashboard is the command centre of TokenLens. When you log in, you immediately see a complete picture of every AI provider your organisation has connected — grouped by category into LLM API Spend, Developer AI Tools, and Business Productivity AI. Each provider card shows its live connection status, total cost over the last 30 days, token consumption, and active user count. You can see at a glance whether a provider is syncing correctly, how much it is costing, and how heavily it is being used — without clicking into any individual section. It is designed for managers and CTOs who need a fast, reliable summary of the entire AI estate before a meeting or at the start of their day.

---

### 2. Intelligence

The Intelligence module answers the most important business questions about AI usage: Who is using it? Which teams spend the most? Which models are being called? Is the money being well spent?

---

#### AI Users
**Status:** ✅ Live

AI Users gives you full visibility into every individual who is consuming AI tokens or seats across your connected providers. You can see each user's total token consumption, total cost, the models they have used, and how their usage has trended over the last 30 days. The drill-down profile page for each user shows a detailed breakdown — their input versus output token ratio, which provider they use most, and a daily activity chart. This is essential for identifying your highest-cost users, spotting misuse or runaway API calls, and understanding which team members are getting the most value from AI tools.

#### AI Teams
**Status:** ✅ Live

AI Teams aggregates usage data at the team level, allowing managers and finance teams to see AI spend and productivity by department or squad. Instead of individual user rows, you get a rolled-up view: which teams are spending the most, how many tokens each team consumes, and how that usage has changed over time. The drill-down page for each team shows all members, their individual contributions, and a team-level cost trend. This makes it easy to allocate AI costs to cost centres, compare ROI across engineering squads, and make budget decisions for the next quarter.

#### AI Models
**Status:** ✅ Live

AI Models provides a cross-provider breakdown of every AI model being called across your organisation. You can see — for each model — the total input tokens, output tokens, combined token count, and exact dollar cost over the last 30 days. This answers a critical question for engineering and finance teams: are developers using the right model for each task? A team that consistently calls GPT-4o or Claude 3 Opus for simple tasks could switch to a smaller, cheaper model and cut costs by 80% with no loss in quality. AI Models surfaces that opportunity directly.

#### AI ROI
**Status:** 🔜 Coming Soon

AI ROI will quantify the business value of your AI investments in concrete terms. Rather than just showing cost, it will calculate productivity metrics — time saved per developer, features shipped faster, support tickets deflected — and compare them against the cost of the tools enabling those gains. Leaders will be able to answer with data: "We spent $12,000 on AI tools last quarter and recovered 400 engineering hours." It will allow comparison across teams and tools, showing which investments are delivering and which need to be reconsidered. Built for CFOs, CTOs, and engineering directors who need to justify AI budgets to boards and stakeholders.

#### Suggestions
**Status:** 🔜 Coming Soon

Suggestions is TokenLens's intelligent advisor layer. It continuously analyses your real usage patterns and surfaces specific, actionable recommendations to reduce cost and improve outcomes. Examples include: flagging that a team is consistently calling a premium model for tasks where a standard model would perform equally well; identifying users who have active seats but have not used a tool in 30 days; or highlighting that a provider's costs have spiked this week compared to the previous month. Every suggestion will include the projected saving and a one-click action path. The goal is to make cost optimisation automatic — you do not have to go looking for inefficiencies, TokenLens will find them for you.

---

### 3. Developer AI Tools

The Developer AI Tools module tracks the AI tools used directly inside the development workflow — the coding assistants and terminal-based agents that engineers use every day. It answers: which developers are getting value from these tools, which are not, and how much each seat is actually costing relative to its usage.

---

#### Overview
**Status:** ✅ Live

The Developer AI Tools Overview gives a consolidated snapshot of all connected developer tools in a single view. It shows total active seats across all tools, combined developer count, aggregate cost, and a daily usage trend. This is the starting point before drilling into a specific tool — useful for an engineering manager who wants a cross-tool comparison before the weekly standup.

#### Claude Code
**Status:** ✅ Live

Claude Code is Anthropic's terminal-based AI coding agent. TokenLens connects to the Anthropic Admin API to pull per-developer usage data — showing how many sessions each developer has run, total tokens consumed (input and output), estimated cost per developer, and a daily activity trend. Engineering managers can see which developers are adopting Claude Code actively, which have barely touched it, and how usage patterns evolve week over week. This is critical for measuring adoption after a rollout and identifying developers who may need onboarding support.

#### GitHub Copilot
**Status:** ✅ Live

GitHub Copilot is the most widely used AI coding assistant in the industry. TokenLens tracks seat assignments, active versus inactive seats, daily active users, code suggestion acceptance rates, and per-developer engagement scores. This surfaces one of the most common wastes in developer tooling: paying for Copilot seats that are assigned but never used. A team of 50 developers each paying $19/month where 15 are inactive is $3,420/year in wasted spend — TokenLens makes that visible immediately.

#### Cursor
**Status:** ✅ Live

Cursor is a full AI-native code editor gaining rapid adoption in engineering teams. TokenLens tracks Cursor seat allocations, active user counts, cost per seat, and usage trend over time. Like GitHub Copilot, one of the main value drivers is identifying paid seats that have gone dormant — ensuring every seat is earning its cost. The daily activity chart lets managers see if adoption is growing, plateauing, or declining after initial rollout.

---

### 4. LLM / API Spend Providers

The LLM / API Spend module tracks direct API consumption — the raw calls your applications and developers make to large language model providers. This is typically the largest and fastest-growing line item in any company's AI budget, and it is the area where visibility matters most.

---

#### Overview
**Status:** ✅ Live

The LLM/API Spend Overview aggregates cost and token data across all connected API providers into one dashboard. It shows total spend over the last 30 days, total tokens consumed, a full-width daily cost trend line chart showing how spend evolves over time per provider, a side-by-side provider cost comparison bar chart, a top-users-by-cost table, and a complete model breakdown table. This is the view a CTO or finance lead opens when they need to understand the full picture of API spend before a budget review.

#### Claude (Anthropic)
**Status:** ✅ Live

The Claude provider detail page gives a deep dive into all Anthropic API usage across your organisation. It breaks tokens down into three categories — input tokens, output tokens, and cached tokens (which cost less) — so engineers can see whether their applications are being built efficiently. The daily cost trend, cost-by-model bar chart, full model table, and top-users table give both financial and technical stakeholders the data they need. Syncs in real time via the Anthropic Admin API.

#### OpenAI
**Status:** ✅ Live

The OpenAI provider detail page mirrors the Claude page — full token breakdown, daily cost trend, model comparison, and top users by cost. As many organisations run both Anthropic and OpenAI models, having both on the same platform allows direct cost comparison and helps teams make data-driven decisions about which provider to route different workloads to. Syncs via the OpenAI Admin API.

#### Gemini (Google)
**Status:** ⚠️ Limited — No Admin API Available

Google currently does not provide a public admin-level API for querying aggregate Gemini usage across an organisation. This means TokenLens cannot automatically pull token counts, cost data, or per-user breakdowns for Gemini. The Provider Limitations page explains this constraint in full. If your organisation uses Gemini, manual cost tracking via the Google Cloud console remains the only option until Google releases an admin API.

#### Perplexity
**Status:** ⚠️ Limited — No Admin API Available

Perplexity does not currently expose an admin API for enterprise usage reporting. Aggregate spend and per-user token data cannot be retrieved programmatically. Similar to Gemini, this is a provider-side limitation rather than a TokenLens limitation. The Provider Limitations page documents this clearly so your team understands why data is absent for this provider.

---

### 5. Business Productivity AI

Business Productivity AI covers the AI tools embedded in everyday workplace applications — the tools used not just by developers but by the entire organisation. These tools operate on seat licences rather than token consumption, and they embed AI into email, documents, spreadsheets, meetings, and chat.

---

#### Overview
**Status:** ✅ Live

The Business Productivity AI Overview gives a top-level picture of all connected business AI tools: total licensed seats, active users, aggregate cost, and an adoption rate across the organisation. For HR, finance, and operations leadership, this view answers: how many people are actually using the tools we are paying for, and is the investment being adopted broadly enough to justify the licence cost?

#### Microsoft Copilot (Microsoft 365)
**Status:** ✅ Live

Microsoft 365 Copilot is one of the largest AI licence investments a company can make — at $30 per user per month, a company of 200 employees pays $72,000 per year. TokenLens connects via the Microsoft Graph API to show exactly how those seats are being used: which users are active, which have gone dormant, how Copilot is being used across apps (Word, Excel, PowerPoint, Teams, Outlook), and what the cost per active user actually is once idle seats are factored in. This gives IT and finance the data to right-size the licence count, reclaim unused seats, and demonstrate adoption progress to leadership.

---

### 6. Governance

The Governance module provides the control, compliance, and configuration layer of TokenLens. It is where administrators manage provider connections, set spending rules, receive alerts, and maintain an audit record of all platform activity.

---

#### Alerts
**Status:** 🔜 Coming Soon

Alerts will allow administrators to define automated rules that trigger when specific conditions are met. Examples include: notify the finance team when monthly API spend exceeds $5,000; alert an engineering manager when a single user's daily token consumption doubles; or flag when a new model appears in usage data that has not been approved. Alerts can be scoped to a specific provider, team, user, or model — giving organisations precise control over their AI spend without requiring manual monitoring. Every alert will show its trigger history and current status on the Alerts dashboard.

#### Notifications
**Status:** 🔜 Coming Soon

Notifications is the delivery layer for all Alerts. Administrators will be able to configure where alert messages are sent — email addresses for individuals, Slack channels for teams, or custom webhook URLs for integration with incident management tools like PagerDuty or Opsgenie. Notification frequency, digest schedules (daily summary vs. real-time), and per-channel preferences will all be configurable. This ensures the right person gets the right information through the channel they actually monitor.

#### Reports
**Status:** 🔜 Coming Soon

Reports will allow any administrator to generate structured summaries of AI usage for a defined time period and scope. Reports can be scoped by provider, by team, by model, or across the full organisation, and exported as PDF for board presentations or CSV for finance processing. Scheduled reports will allow monthly cost summaries to be delivered automatically to a finance inbox on the first of each month — removing the need for anyone to manually pull data before budget reviews.

#### Audit Logs
**Status:** 🔜 Coming Soon

Audit Logs will maintain a full, tamper-evident record of every action taken within TokenLens — who connected or disconnected a provider, who changed an alert threshold, when a sync ran and whether it succeeded, and who exported a report. This is essential for organisations operating under compliance frameworks such as SOC 2, ISO 27001, or internal security policies that require a traceable record of who had access to sensitive cost and usage data and what they did with it. Logs will be searchable by actor, action type, and date range.

#### Provider Limits
**Status:** ✅ Live

Provider Limits is a transparency page that documents every known limitation in the TokenLens provider integration layer. Currently this covers Gemini and Perplexity, which do not offer admin APIs for programmatic usage data retrieval. The page explains clearly what data is unavailable, why it cannot be retrieved, and what alternatives exist. This prevents confusion when users notice that data is missing for certain providers — they can immediately understand the reason and set accurate expectations with their stakeholders.

#### Settings
**Status:** ✅ Live

Settings is the central configuration hub for every provider integration in TokenLens. Administrators connect providers by entering their API keys, OAuth tokens, or admin credentials — all of which are encrypted at rest using AES-256-GCM before storage. Each provider row shows its current connection status, the last successful sync time, and available actions. Manual sync can be triggered at any time for connected providers. Providers that are not yet configured are visually dimmed and their sync button is disabled, preventing accidental actions. Limited providers (Gemini, Perplexity) show a clear explanation and link to the Provider Limits page instead of a configuration form.

---

## Feature Status Summary

| Feature | Module | Status |
|---------|--------|--------|
| Dashboard | Overview | ✅ Live |
| AI Users | Intelligence | ✅ Live |
| AI Teams | Intelligence | ✅ Live |
| AI Models | Intelligence | ✅ Live |
| AI ROI | Intelligence | 🔜 Coming Soon |
| Suggestions | Intelligence | 🔜 Coming Soon |
| Developer AI Tools — Overview | Developer AI | ✅ Live |
| Claude Code | Developer AI | ✅ Live |
| GitHub Copilot | Developer AI | ✅ Live |
| Cursor | Developer AI | ✅ Live |
| LLM/API Spend — Overview | API Spend | ✅ Live |
| Claude (Anthropic) | API Spend | ✅ Live |
| OpenAI | API Spend | ✅ Live |
| Gemini | API Spend | ⚠️ Limited |
| Perplexity | API Spend | ⚠️ Limited |
| Business Productivity AI — Overview | Business AI | ✅ Live |
| Microsoft Copilot | Business AI | ✅ Live |
| Alerts | Governance | 🔜 Coming Soon |
| Notifications | Governance | 🔜 Coming Soon |
| Reports | Governance | 🔜 Coming Soon |
| Audit Logs | Governance | 🔜 Coming Soon |
| Provider Limits | Governance | ✅ Live |
| Settings | Governance | ✅ Live |

---

## Provider Integration Matrix

| Provider | Category | Data Source | Status |
|----------|----------|-------------|--------|
| Anthropic (Claude) | LLM API Spend + Developer AI | Anthropic Admin API | ✅ Live |
| OpenAI | LLM API Spend | OpenAI Admin API | ✅ Live |
| Google Gemini | LLM API Spend | No Admin API | ⚠️ Limited |
| Perplexity | LLM API Spend | No Admin API | ⚠️ Limited |
| GitHub Copilot | Developer AI | GitHub Copilot Business API | ✅ Live |
| Cursor | Developer AI | Cursor Admin API | ✅ Live |
| Microsoft 365 Copilot | Business AI | Microsoft Graph API | ✅ Live |

---

*TokenLens — Track token usage, costs & productivity across all your AI tools.*
