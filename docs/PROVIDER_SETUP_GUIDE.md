# TokenLens — Provider Setup & Credential Guide

> **Purpose:** Step-by-step credential setup instructions for every provider in TokenLens.
> Use this document when performing real-key testing against live provider APIs.
>
> **This document does not contain real credentials.** It describes what to obtain and where.
> Never commit real API keys, tokens, or secrets to this repository.

---

## Table of Contents

| Provider | Category | Status |
|---|---|---|
| [Anthropic / Claude](#1-anthropic--claude) | LLM / API Spend | ✅ Live / Production |
| [Claude Code](#2-claude-code) | Developer AI Tools | ✅ Live / Production |
| [OpenAI](#3-openai) | LLM / API Spend | 🔬 Demo · Ready for real-key testing |
| [GitHub Copilot](#4-github-copilot) | Developer AI Tools | 🔬 Demo · Ready for real-key testing |
| [Cursor](#5-cursor) | Developer AI Tools | 🔬 Demo · Endpoint verification pending |
| [Microsoft 365 Copilot](#6-microsoft-365-copilot) | Business Productivity AI | 🔬 Demo · Ready for real-key testing |
| [Gemini](#7-gemini) | LLM / API Spend | ⚠️ Limited — no admin API exists |
| [Perplexity](#8-perplexity) | LLM / API Spend | ⚠️ Limited — no admin API exists |

> **What "Demo" means:** Connector code is implemented and unit-tested. The provider currently displays demo data from `seed.ts`. Adding a real credential in Settings and clicking Sync will purge the demo rows and replace them with live API data on the first successful sync.

---

## 1. Anthropic / Claude

### Status
✅ **Production** — fully integrated, real data syncing in Phase 1.

### What TokenLens fetches
- Token usage per user per day (input, output, cached tokens)
- Cost per user per day (USD)
- Model usage breakdown (Claude 3 Opus, Claude 3 Sonnet, Claude 3.5 Sonnet, etc.)
- Org-level aggregate cost and token totals
- Workspace members list

### What is NOT available via API
- Real-time sub-hour usage (API aggregates with up to 1-hour delay)
- Billing invoices or payment method information
- AWS Bedrock / Azure / Vertex AI usage (only Anthropic-hosted API)

### Credential type
**Admin API Key** — a separate credential class from standard Claude API keys.

> ⚠️ A standard API key (`sk-ant-api03-...`) will NOT work. You must use an Admin API key (`sk-ant-admin01-...`).

### Where to obtain
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to **Settings → Admin Keys**
3. Click **Create Admin Key**
4. Copy the key — it is shown only once

### Requirements
- Must be an **Organization account** (not a personal Claude account)
- The issuing user must have **Admin** role in the Anthropic Console workspace
- No additional scopes to configure — Admin API keys have full read access to org usage data

### Credential format in TokenLens
Single plain-text string entered in the API key field on the Settings page:

```
sk-ant-admin01-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxx
```

### How to connect
1. Go to **Settings → Provider Integrations → Claude / Anthropic → Configure**
2. Paste the Admin API key
3. Click **Connect & Verify**
4. Once connected, click **Sync** or **Sync All**

### Expected sync output
- `UsageDaily` rows — one per user per day (last 7 days)
- `ModelUsageDaily` rows — one per model per day
- `ClaudeCodeDaily` rows — synced via Claude Code worker (same credential)
- `ProviderSyncRun` record with `status: "success"` and `recordsSynced > 0`

---

## 2. Claude Code

### Status
✅ **Production** — real data syncing in Phase 1. No separate credential.

### What TokenLens fetches
- Developer sessions per user per day
- Lines of code added/removed
- Commits and PRs assisted by Claude Code
- Active developer count

### Credential type
**Reuses the Anthropic Admin API key.** No separate credential is required for Claude Code.

> Claude Code syncs via the same Anthropic Admin API connection. If Anthropic is connected, Claude Code will sync automatically.

### How to connect
Connect Anthropic (see §1 above). Claude Code will sync automatically as part of the same connection.

### Expected sync output
- `ClaudeCodeDaily` rows — one per user per day (last 7 days)
- `ProviderSyncRun` record for provider `"claude_code"` with `status: "success"`

---

## 3. OpenAI

### Status
🔬 **Phase 2B — real-key testing pending.** Connector fully implemented. Demo data is shown until a real key is added.

### What TokenLens fetches
- Token usage per user, per model, per project (daily buckets)
- Cost per project (daily buckets, using server-reported cost if available)
- Model breakdown: GPT-4o, GPT-4o mini, GPT-4 Turbo, o1, o3, etc.

### What is NOT available via API
- Sub-day usage granularity (minimum bucket is 1 day)
- Billing invoices / payment information

### Credential type
**Admin API Key** — separate from project-level API keys.

> ⚠️ A project key (`sk-proj-...`) will NOT work. You need an Organization Admin API key (`sk-org-...` or a key from the Admin API section).

### Where to obtain
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to **Settings → Organization → Admin API Keys**
3. Click **Create new Admin API key**
4. Copy immediately — shown only once

**URL:** `platform.openai.com/settings/organization/admin-keys`

### Requirements
- Must be an **Organization** account (not a personal account)
- The issuing user must have **Owner** or **Admin** role in the OpenAI organization
- Users in the org must have their **Default Organization** set in their personal OpenAI settings, otherwise their usage won't appear in org-level usage reports
- The Admin API key endpoint (`/organization/usage/completions`) is available on **all paid tiers**

### Credential format in TokenLens
Single plain-text string entered in the API key field on the Settings page:

```
sk-org-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### How to connect
1. Go to **Settings → Provider Integrations → OpenAI → Configure**
2. Paste the Admin API key
3. Click **Connect & Verify**
4. Once connected, click **Sync** next to OpenAI

### Expected sync output
- `AiUsageDaily` rows — one per user per day per model (last 7 days)
- `AiModelUsageDaily` rows — one per model per day (aggregated across all users)
- `ProviderSyncRun` record with `status: "success"` and `recordsSynced > 0`

### Known limitations at sync time
- Project-level rows (`project_id` set, `user_id` null) are included — stored as `project:<project_id>` email
- If all users show 0 token usage, check that users have their Default Organization set

---

## 4. GitHub Copilot

### Status
🔬 **Phase 2B — real-key testing pending.** Connector fully implemented. Demo data is shown until credentials are added.

### What TokenLens fetches
- Seat count (total licensed, active in last 30 days)
- Per-user acceptance rates, last activity, editor used
- Suggestion and completion metrics (28-day rolling window)

### What is NOT available via API
- Dollar cost — computed as `seats × $19/month`
- Model-level breakdown
- Historical data before October 10, 2025
- Sub-28-day granularity (all metrics are rolling windows)

### Credential type
**JSON object** with two fields:
- `org` — your GitHub organization login (the slug, not the display name)
- `token` — a Personal Access Token (PAT) with the required scope

### Where to obtain
**GitHub organization slug:**
1. Your GitHub org URL is `github.com/<org-slug>` — the slug is the part after the `/`

**Personal Access Token:**
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Set a meaningful description (e.g. "TokenLens – Copilot Metrics")
4. Set expiry (90 days or 1 year recommended)
5. Select scope: **`manage_billing:copilot`**
   - This is the minimum required scope for reading seat and usage data
   - For read-only access, `read:org` is sufficient for seat data but may not cover metrics endpoints
6. Click **Generate token** and copy immediately

### Requirements
- The GitHub organization must be on **Copilot Business** or **Copilot Enterprise** plan
- The PAT owner must be an **Organization Owner** or have **Billing Manager** role
- Scope required: `manage_billing:copilot`
- The new metrics endpoints (`/copilot/metrics/reports/*`) were introduced after April 2026 — older plans may only expose seat data

### Credential format in TokenLens
JSON object entered in the Configure modal:

```json
{
  "org": "my-github-org",
  "token": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

> **Important:** The `org` field is the GitHub organization **login** (slug), not the display name.
> Example: if your org is at `github.com/acme-corp`, use `"org": "acme-corp"`.

### How to connect
1. Go to **Settings → Provider Integrations → GitHub Copilot → Configure**
2. Enter the **GitHub Organization Name** (slug) in the first field
3. Enter the **Personal Access Token** in the second field
4. Click **Connect & Verify**
5. Once connected, click **Sync** next to GitHub Copilot

### Expected sync output
- `SeatUsageDaily` row — total and active seat count for today
- `DeveloperAiDaily` rows — one per user (with suggestions, acceptances, active days)
- `ProviderUserMapping` rows — GitHub login → email mapping
- `ProviderSyncRun` record with `status: "success"`

### Troubleshooting
| Symptom | Likely cause |
|---|---|
| `GitHub API 403` | PAT scope is wrong or owner is not an org admin |
| `GitHub API 404` on seats endpoint | Org is not on Copilot Business/Enterprise plan |
| `metrics API unavailable` warning | Metrics endpoint may not be available on this plan; seat data will be used as fallback |
| Per-user suggestions = 0 | Metrics API fell back to seat data (completions count is 0 in seat-data fallback) |

---

## 5. Cursor

### Status
🔬 **Phase 2B — real-key testing pending.** Connector fully implemented. Demo data is shown until credentials are added.

> ⚠️ **Cursor's API is not publicly documented.** The connector tries all known endpoint paths automatically. If all return 404, a warning is added to the sync run error message but the sync does not fail hard.

### What TokenLens fetches
- Member list (seat count, user emails)
- Daily usage per user: lines added/deleted, suggestions shown/accepted, tab completions, composer/chat/agent requests
- Per-user spending in USD (premium model requests only)

### What is NOT available via API
- Base subscription cost (flat rate, not in the API)
- Granular usage events (may be Enterprise-only)
- History beyond a 30-day API window

### Credential type
**Admin API Key** — generated in Cursor team settings.

> ⚠️ This is an **Admin** (team-level) key, not a personal Cursor API key. Personal keys will return `403 Forbidden`.

### Where to obtain
1. Go to [cursor.com/settings](https://www.cursor.com/settings)
2. Navigate to your team / organization settings
3. Look for **Admin API Key** or **Team API Key** section
4. Generate and copy the key

> If you cannot find an Admin API Key section, your Cursor plan may not include API access. Cursor Business plan (`$40/user/month`) includes admin API access.

### Requirements
- **Cursor Business** plan or higher
- Must be a team **Admin** to generate the key
- Endpoint paths are undocumented and may change — connector retries all known paths

### Credential format in TokenLens
Single plain-text string entered in the API key field on the Settings page:

```
cursor_admin_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

*(Exact token prefix may vary — Cursor does not publish a consistent format.)*

### How to connect
1. Go to **Settings → Provider Integrations → Cursor → Configure**
2. Paste the Admin API key
3. Click **Connect & Verify**
4. Once connected, click **Sync** next to Cursor

### Expected sync output
- `SeatUsageDaily` row — member count for today
- `DeveloperAiDaily` rows — one per user per day (last 7 days)
- `ProviderSyncRun` record with `status: "success"`

### Troubleshooting
| Symptom | Likely cause |
|---|---|
| `403 Forbidden` | Using a personal key instead of Admin key |
| `401 Unauthorized` | API key is invalid or expired |
| Warning: "all endpoint paths may have returned 404" | Cursor changed their API paths — check if any path pattern in `connector.ts` still works |
| `members = 0`, `dailyRows = 0` | All endpoint paths returned 404 — verify with Cursor support what the current API path is |

---

## 6. Microsoft 365 Copilot

### Status
🔬 **Phase 2B — real-key testing pending.** Connector fully implemented. Demo data is shown until credentials are added.

### What TokenLens fetches
- Licensed seat count (from `subscribedSkus` — Microsoft 365 Copilot SKU)
- Active users per app in the last 30 days (Teams, Word, Excel, Outlook, PowerPoint, OneNote, Loop, Copilot Chat)
- Last activity date per user per app
- User Principal Names (UPNs)

### What is NOT available via API
- Dollar cost — computed as `seats × $30/month`
- Prompt or interaction counts per user (only last-activity dates)
- Sub-30-day granularity (rolling D7/D30/D90/D180 windows only)

### Credential type
**Azure App Registration** (service principal) with Microsoft Graph permissions.

The credential is a **JSON object** with three fields:
- `tenantId` — Azure Directory (tenant) ID (GUID format)
- `clientId` — Application (client) ID from the App Registration (GUID format)
- `clientSecret` — Client secret value from the App Registration

### Where to obtain — step by step

**Step 1 — Create an App Registration in Azure Entra ID**

1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID → App registrations**
3. Click **New registration**
4. Set a name (e.g. `TokenLens-Copilot-Reader`)
5. Supported account types: **Accounts in this organizational directory only**
6. Redirect URI: leave blank (not needed for client credentials flow)
7. Click **Register**

**Step 2 — Copy the IDs**

On the App Registration overview page:
- Copy **Application (client) ID** → this is your `clientId`
- Copy **Directory (tenant) ID** → this is your `tenantId`

**Step 3 — Create a Client Secret**

1. In the App Registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g. `tokenlens-prod`) and set an expiry
4. Click **Add**
5. **Copy the secret value immediately** — it is not shown again
6. This is your `clientSecret`

**Step 4 — Grant API permissions**

1. In the App Registration, go to **API permissions**
2. Click **Add a permission → Microsoft Graph → Application permissions**
3. Search for and add: **`Reports.Read.All`**
4. Click **Grant admin consent for [your tenant]**
   - This requires a **Global Administrator** or **Application Administrator** Azure role
   - Without admin consent, the connector will return `403` on every Graph call

### Requirements
- Microsoft 365 tenant with **Copilot for Microsoft 365** licenses assigned to users
- App Registration must have `Reports.Read.All` **application** permission (not delegated)
- **Admin consent** must be granted (a Global Admin or Privileged Role Admin must click "Grant consent")
- The Azure account used to create the App Registration needs **Application Administrator** or higher role

> Note: TokenLens uses the **Microsoft Graph Beta endpoint** for the user-detail report (`/beta/reports/getMicrosoft365CopilotUsageUserDetail`). The v1.0 endpoint may not provide per-user granularity.

### Credential format in TokenLens
JSON object entered in the Configure modal:

```json
{
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

> Both `tenantId` and `clientId` must be valid GUIDs (format: `8-4-4-4-12` hex characters).
> The connector validates GUID format before attempting authentication.

### How to connect
1. Go to **Settings → Provider Integrations → Microsoft Copilot → Configure**
2. Enter the **Tenant ID**, **Client (Application) ID**, and **Client Secret** in the respective fields
3. Click **Connect & Verify** — this calls `testMicrosoftConnection()` which performs a lightweight `subscribedSkus` check
4. Once connected, click **Sync** next to Microsoft Copilot

### Expected sync output
- `SeatUsageDaily` row — licensed seat count for today
- `BusinessAiDaily` rows — one per app (Teams, Word, Excel, Outlook, PowerPoint, OneNote, Loop, Copilot Chat)
- `ProviderUserMapping` rows — UPN to TokenLens user mapping
- `ProviderSyncRun` record with `status: "success"`

### Troubleshooting
| Symptom | Likely cause |
|---|---|
| `Microsoft auth failed: AADSTS70011` | Wrong scope or app config — verify the App Registration is set up with application permissions, not delegated |
| `Graph API 403` on subscribedSkus | Admin consent was not granted — a Global Admin must consent in Azure Portal |
| `Graph API 403` on reports endpoint | `Reports.Read.All` permission is missing or consent was not granted |
| `tenantId does not look like a valid GUID` | Pasted the wrong value — use the Directory (tenant) ID from Entra ID overview, not the domain |
| Licensed seat count = 0 | The Copilot SKU was not found — verify the tenant has Microsoft 365 Copilot licenses assigned |
| All app active users = 0 | No users have activity in the D30 window, or the CSV header mapping failed — check `errorMessage` in sync run history |

---

## 7. Gemini

### Status
⚠️ **Limited** — no admin usage API available. TokenLens cannot sync live data from Gemini.

### Why this provider is limited

Google does not provide a programmatic REST endpoint to query **aggregate Gemini API usage or cost** across an organisation. The Gemini API (`generativelanguage.googleapis.com`) exposes only per-call token counts in the response body — there is no `/usage`, `/billing`, or `/organization/usage` endpoint that can be polled for historical aggregate data.

**What exists but is out of scope for TokenLens:**
- **Google Cloud Billing Export to BigQuery** — raw billing records can be exported to BigQuery and queried with SQL. This requires BigQuery setup, IAM roles, and a custom ETL pipeline. Not feasible with a simple API key.
- **AI Studio usage dashboard** — visible in the Google AI Studio web console, but not accessible via API.

### Workarounds (manual, out of scope for TokenLens)
- Export Cloud Billing data to BigQuery and build a custom query
- Use per-call `usageMetadata` in API responses to track tokens client-side in your application code

### In TokenLens
- Gemini appears in the sidebar under **LLM/API Spend Providers** as **Limited**
- Clicking it navigates to `/limitations` which explains the constraint
- No Connect button, no Sync button — by design
- Demo data from `seed.ts` is shown in the dashboard for illustration purposes

---

## 8. Perplexity

### Status
⚠️ **Limited** — no admin usage API available. TokenLens cannot sync live data from Perplexity.

### Why this provider is limited

Perplexity does not expose a **programmatic billing or usage REST API** at any plan tier (Free, Pro, Business, or Enterprise). There is no endpoint to query historical token usage, cost, or user-level activity programmatically.

**What exists but is out of scope for TokenLens:**
- **Enterprise audit log webhooks** — available at 50+ seat Enterprise plans. Webhooks push individual query events to a configured endpoint. This is event-streaming, not queryable history, and requires a custom ingestion pipeline.
- **Web console usage dashboard** — visible at perplexity.ai/settings/admin (Enterprise only), not API-accessible.

### Workarounds (manual, out of scope for TokenLens)
- Configure Enterprise webhook audit logs and build a custom ingestion pipeline
- Manually export usage data from the admin console on a scheduled basis

### In TokenLens
- Perplexity appears in the sidebar under **LLM/API Spend Providers** as **Limited**
- Clicking it navigates to `/limitations` which explains the constraint
- No Connect button, no Sync button — by design
- Demo data from `seed.ts` is shown in the dashboard for illustration purposes

---

## Quick Reference — Credential Formats

| Provider | Format | Fields |
|---|---|---|
| Anthropic | Plain text | `sk-ant-admin01-...` |
| Claude Code | (reuses Anthropic) | — |
| OpenAI | Plain text | `sk-org-...` |
| GitHub Copilot | JSON | `{ "org": "slug", "token": "ghp_..." }` |
| Cursor | Plain text | `cursor_admin_...` (prefix may vary) |
| Microsoft Copilot | JSON | `{ "tenantId": "guid", "clientId": "guid", "clientSecret": "..." }` |
| Gemini | Not supported | — |
| Perplexity | Not supported | — |

---

## Real-Key Testing Checklist

Use this checklist when testing a new provider for the first time:

- [ ] Credential obtained and available in a secure password manager (not in this repo)
- [ ] Credential format matches the expected format above
- [ ] Settings page opened at `/settings`
- [ ] Provider configured via **Configure** modal
- [ ] **Test Connection** (Connect & Verify) returns success
- [ ] **Sync** triggered from the Data Sync section
- [ ] `ProviderSyncRun` record visible in **Recent Sync Runs** table with `status: success`
- [ ] `recordsSynced` count is > 0
- [ ] Provider detail page shows live data (not all zeroes)
- [ ] Demo data was correctly purged before live data was written
- [ ] No `errorMessage` in the sync run record

---

## Security Reminders

- Never commit real API keys, tokens, or secrets to this repository
- Credentials entered in the TokenLens UI are encrypted at rest using **AES-256-GCM** before being stored in the database
- The encryption key is stored in the `ENCRYPTION_KEY` environment variable — never in the DB or in code
- `ProviderSyncRun.errorMessage` is sanitized before storage — Bearer tokens, `sk-ant-`, `ghp_`, `sk-org-` patterns, and high-entropy strings are redacted
- TokenLens never stores prompt text, code content, AI responses, or any payload data — only metadata (token counts, costs, dates, user emails, model names)

---

*TokenLens · docs/PROVIDER_SETUP_GUIDE.md · Updated May 2026 · Phase 2B real-key testing guide*
