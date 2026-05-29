# Phase 2B Provider Function Validation

> Static analysis of all Phase 2B provider integrations. No real API calls are made here.
> Run: `npm run validate:providers`

**Current readiness (May 2026):**
- **Live / Production:** Anthropic, Claude Code — real keys connected, data flowing in customer environments
- **Demo · Ready for real-key testing:** OpenAI, GitHub Copilot, Microsoft 365 Copilot — connectors implemented, validated via static analysis + fixtures, awaiting real-key smoke test
- **Demo · Endpoint verification pending:** Cursor — connector implements multi-path fallback because Cursor's API is undocumented; real-key sync needed to confirm which endpoints actually respond
- **Limited:** Gemini, Perplexity — no admin API exists provider-side; not connectable

All non-production providers currently display demo data from `seed.ts`. Sync workers purge demo rows before inserting live data on the first successful sync.

---

## 1. Provider Function Matrix

| Provider | Registry Entry | Credentials | testConnection | Sync Worker | DB Targets | API Read Path | Status |
|---|---|---|---|---|---|---|---|
| **OpenAI** | ✅ `openai` | Admin API Key (`sk-org-...`) | `testOpenAIConnection()` | `sync-openai.worker.ts` | `AiUsageDaily`, `AiModelUsageDaily` | `/api/llm-spend/openai` | Live |
| **GitHub Copilot** | ✅ `github_copilot` | JSON `{org, token}` | `testGitHubConnection()` | `sync-github-copilot.worker.ts` | `DeveloperAiDaily`, `SeatUsageDaily`, `ProviderUserMapping` | `/api/developer-ai-tools/github-copilot` | Live |
| **Cursor** | ✅ `cursor` | Admin API Key | `testCursorConnection()` | `sync-cursor.worker.ts` | `DeveloperAiDaily`, `SeatUsageDaily` | `/api/developer-ai-tools/cursor` | Live |
| **Microsoft Copilot** | ✅ `microsoft_copilot` | JSON `{tenantId, clientId, clientSecret}` | `testMicrosoftConnection()` | `sync-microsoft-copilot.worker.ts` | `BusinessAiDaily`, `SeatUsageDaily`, `ProviderUserMapping` | `/api/business-productivity-ai` | Live |
| **Gemini** | ✅ `gemini` (limited) | N/A — no admin API | N/A | None | None (demo data only) | `/api/llm-spend/gemini` (seed data) | Limited |
| **Perplexity** | ✅ `perplexity` (limited) | N/A — no admin API | N/A | None | None (demo data only) | `/api/llm-spend/perplexity` (seed data) | Limited |
| **Anthropic** | ✅ `anthropic` | Admin API Key | Tested via Phase 1 | `sync-claude-usage.worker.ts` | `UsageDaily`, `ModelUsageDaily` | `/api/llm-spend/claude` | Live (Phase 1) |
| **Claude Code** | ✅ `claude_code` | Uses Anthropic key | Uses Anthropic conn | `sync-claude-code.worker.ts` | `ClaudeCodeDaily` | `/api/developer-ai-tools/claude-code` | Live (Phase 1) |

---

## 2. Data Flow per Provider

### OpenAI
1. **Credential**: Admin API key stored encrypted (`ProviderConnection.encryptedApiKey`)
2. **API call**: `GET /organization/usage/completions?group_by=user_id,model,project_id&bucket_width=1d` with pagination via `has_more` / `next_page`
3. **Normalization**: Token counts extracted per user+model+date; cost estimated via in-worker price table; model totals pre-aggregated in a `Map<"model|dateISO", ...>` to avoid last-write-wins on upsert
4. **DB write**: `AiUsageDaily` (per user row), `AiModelUsageDaily` (per model+date aggregate); demo data purged before first write
5. **API read**: `GET /api/llm-spend/openai` reads `AiUsageDaily` + `AiModelUsageDaily`, scoped by `organizationId`
6. **UI**: `/llm-spend/openai` — trend chart, per-user table, per-model breakdown

### GitHub Copilot
1. **Credential**: JSON `{"org": "my-org", "token": "ghp_..."}` stored encrypted
2. **API call**: `GET /orgs/{org}/copilot/billing/seats?per_page=100&page=N` (paginated, terminates when batch < 100); then metrics from `/copilot/metrics/reports/users-28-day/latest` or `/copilot/usage` (with seat-data fallback)
3. **Normalization**: Active seats = seats with `last_activity_at` within 30 days; cost = seats × $19/30 per day; suggestions/acceptances from metrics API
4. **DB write**: `SeatUsageDaily` (one row per day), `DeveloperAiDaily` (one per user per sync), `ProviderUserMapping` (GitHub login → email mapping)
5. **API read**: `GET /api/developer-ai-tools/github-copilot` reads `DeveloperAiDaily` + `SeatUsageDaily`
6. **UI**: `/developer-ai-tools/github-copilot` — seat utilization, acceptance rate, per-user activity

### Cursor
1. **Credential**: Admin API key from Cursor team settings
2. **API call**: Multi-path fallback for members (`/v1/members`, `/members`, `/v1/team/members`, `/team/members`), daily usage, and spending — tries each base URL (api.cursor.com, api.cursor.sh); returns `null` if all 404
3. **Normalization**: Active seats = members with suggestions or lines_added in last 7 days; spending from `spend_cents / 100`; session = any composer/chat/agent request > 0
4. **DB write**: `SeatUsageDaily` (one row per day), `DeveloperAiDaily` (per user+date)
5. **Warning**: If both members and daily usage are empty, a warning is added to `errors[]` indicating possible 404 on all endpoints
6. **API read**: `GET /api/developer-ai-tools/cursor` reads `DeveloperAiDaily` + `SeatUsageDaily`
7. **UI**: `/developer-ai-tools/cursor` — seat count, suggestions, per-user table

### Microsoft Copilot
1. **Credential**: JSON `{"tenantId": "...", "clientId": "...", "clientSecret": "..."}` (Azure App Registration)
2. **Auth**: OAuth 2.0 client credentials flow → Bearer token for Microsoft Graph
3. **API calls**:
   - `GET /subscribedSkus?$select=skuPartNumber,consumedUnits` — finds `Microsoft_365_Copilot` SKU for seat count (matches case-insensitively via `toLowerCase().includes("copilot")`)
   - `GET /reports/getMicrosoft365CopilotUsageUserDetail(period='D30')` — returns CSV with per-user activity dates per app (Teams, Word, Excel, Outlook, PowerPoint, OneNote, Loop, CopilotChat)
4. **Normalization**: CSV parsed with `parseCopilotUserDetailCSV()`; per-app active users counted from `hasCopilotLicense=true` rows; seat cost = totalLicensed × $30/30
5. **DB write**: `SeatUsageDaily` (one row), `BusinessAiDaily` (one per app per day), `ProviderUserMapping` (UPN)
6. **API read**: `GET /api/business-productivity-ai` reads `BusinessAiDaily` + `SeatUsageDaily`
7. **UI**: `/business-productivity-ai/microsoft-copilot` — app breakdown, seat utilization

---

## 3. Mock Fixtures

| File | What It Tests |
|---|---|
| `tests/fixtures/providers/openai-usage.json` | OpenAI paginated usage: 2 pages, `has_more` flag, 3 models, 3 users, 2 days, project-level rows with `user_id: null` |
| `tests/fixtures/providers/github-copilot-seats.json` | GitHub seats: 22 total, 16 active (<30d), 4 inactive (>30d), 2 null activity |
| `tests/fixtures/providers/github-copilot-users.json` | GitHub user metrics: 20 users with completions counts and active days |
| `tests/fixtures/providers/cursor-members.json` | Cursor members response: 15 members with id/email/name/role |
| `tests/fixtures/providers/cursor-usage.json` | Cursor daily usage: 10 users × 7 days = 70 rows; includes zero-activity days |
| `tests/fixtures/providers/microsoft-subscribed-skus.json` | M365 SKUs: includes `Microsoft_365_Copilot` SKU (25 units) and Office E3 |
| `tests/fixtures/providers/microsoft-copilot-user-detail.csv` | M365 user detail CSV: 25 rows, 20 licensed, mix of active/inactive apps |

---

## 4. Known Gaps

| Gap | Description | Impact | Resolution |
|---|---|---|---|
| ~~`ProviderSyncRun` not written~~ | ✅ **Fixed** — All 6 workers now call `startSyncRun` / `completeSyncRun` / `failSyncRun` via `workers/sync-run-logger.ts` | Resolved | See Section 8 |
| ~~Microsoft CSV field name mismatch~~ | ✅ **Fixed** — `CSV_HEADER_MAP` in `microsoft_copilot/connector.ts` normalizes real MS Graph CSV headers to camelCase fields | Resolved | `parseCopilotUserDetailCSV` now maps `"Last Activity Date (Teams)"` → `lastActivityDateTeams` |
| Cursor API paths undocumented | Cursor's API paths are not publicly documented; primary paths may return 404 | Worker falls back to all known alternatives; if all fail, 404 warning is added to errors | Validate with real Cursor admin key |
| GitHub metrics endpoint post-April 2026 | Old `/copilot/metrics` endpoints retired; new endpoints tried but may not be available on all plans | Falls back to seat data (0 completions) | Validate with real GitHub org |
| OpenAI `has_more: undefined` | Older OpenAI API versions may return no `has_more` field; fixed with `data.has_more ? (data.next_page ?? null) : null` | Without fix: would treat undefined as falsy (correct), but `data.next_page ?? null` ensures no undefined next_page | Fix applied |
| Gemini / Perplexity | No admin API exists; providers are `limited: true` and show demo data only | No real data can be synced | By design — directed to `/limitations` page |

---

## 5. Real Key Testing Checklist

When real provider credentials are available, perform the following:

### OpenAI
- [ ] Add Admin API key in Settings → OpenAI → Connect
- [ ] Click "Sync Now" and verify no errors in response
- [ ] Check `/llm-spend/openai` shows real model breakdown
- [ ] Verify `AiModelUsageDaily` has one row per model per day (not per-user rows)
- [ ] Confirm demo data was purged before live data written

### GitHub Copilot
- [ ] Add credentials JSON `{"org":"<your-org>","token":"ghp_..."}` in Settings → GitHub Copilot
- [ ] Click "Sync Now"
- [ ] Verify seat count matches GitHub Copilot → Settings → Seats
- [ ] Verify `last_activity_at` dates are recent for active users
- [ ] Check `/developer-ai-tools/github-copilot` shows correct active seat count

### Cursor
- [ ] Add Admin API key in Settings → Cursor
- [ ] Click "Sync Now"
- [ ] If sync errors contain "Warning: Cursor API returned no members" → check that the API key is an Admin key (not a personal key) and the Cursor plan includes admin API access
- [ ] Verify member count matches Cursor team settings
- [ ] Check `/developer-ai-tools/cursor` shows per-user suggestions

### Microsoft Copilot
- [ ] Create Azure App Registration with `Reports.Read.All` application permission + admin consent
- [ ] Add credentials JSON `{"tenantId":"...","clientId":"...","clientSecret":"..."}` in Settings → Microsoft Copilot
- [ ] Click "Test Connection" to verify OAuth flow works
- [ ] Click "Sync Now"
- [ ] Verify licensed seat count matches M365 Admin Center → Copilot licenses
- [ ] Check `/business-productivity-ai/microsoft-copilot` shows app breakdown

---

## 6. DB Write Targets

| Provider | Tables Written | Key (unique constraint) |
|---|---|---|
| OpenAI | `AiUsageDaily` | `organizationId + provider + date + userEmail` |
| OpenAI | `AiModelUsageDaily` | `organizationId + provider + model + date` |
| GitHub Copilot | `SeatUsageDaily` | `organizationId + provider + date` |
| GitHub Copilot | `DeveloperAiDaily` | `organizationId + provider + date + userEmail` |
| GitHub Copilot | `ProviderUserMapping` | `organizationId + provider + providerUserId` |
| Cursor | `SeatUsageDaily` | `organizationId + provider + date` |
| Cursor | `DeveloperAiDaily` | `organizationId + provider + date + userEmail` |
| Microsoft Copilot | `SeatUsageDaily` | `organizationId + provider + date` |
| Microsoft Copilot | `BusinessAiDaily` | `organizationId + provider + app + date` |
| Microsoft Copilot | `ProviderUserMapping` | `organizationId + provider + providerUserId` |
| All providers | `ProviderSyncRun` | `id` (auto) — written by `sync-run-logger.ts` |

All workers also update `ProviderConnection.lastSyncAt` / `status` via `markProviderSynced()` / `markProviderFailed()`.

---

## 7. Security Notes

### What IS stored
- Encrypted API keys / credentials (`AES-256-GCM`, key from `ENCRYPTION_KEY` env var)
- Token counts, cost estimates, user email addresses, model names
- GitHub login → email mappings
- Microsoft UPNs (user principal names, which are email addresses)
- Seat counts and activity dates (no prompt content)

### What is NOT stored
- Prompt text, code content, or any AI conversation content
- Passwords or personal access token values in plaintext
- Billing card or invoice data
- OAuth refresh tokens (client credentials flow has no refresh token)
- IP addresses or session data beyond JWT auth

### Key rotation
- `ENCRYPTION_KEY` must be a 32-byte base64 value
- Rotating the key requires re-encrypting all `ProviderConnection.encryptedApiKey` values before the old key is removed
- There is no automated key rotation currently; manual rotation only

### Scope validation
- Every API route and worker filters by `organizationId` from the session JWT
- Workers receive `organizationId` as an explicit parameter, never from user input
- `getProviderCredential()` in `connector.interface.ts` fetches credentials only for the given `organizationId`

---

## 8. ProviderSyncRun Logging

### Overview

All 6 sync workers write audit records to the `ProviderSyncRun` table via the shared helper `workers/sync-run-logger.ts`.

### Helper: `workers/sync-run-logger.ts`

| Export | Signature | Behavior |
|---|---|---|
| `startSyncRun` | `(organizationId, provider) → SyncRunHandle` | Creates a `ProviderSyncRun` row with `status: "running"` and `recordsSynced: 0` |
| `completeSyncRun` | `(runId, synced) → void` | Updates row to `status: "success"`, sets `recordsSynced` and `finishedAt` |
| `failSyncRun` | `(runId, err) → void` | Updates row to `status: "failed"`, sets `errorMessage` (sanitized, max 500 chars) and `finishedAt` |
| `sanitizeErrorMessage` | `(msg) → string` | Strips API keys, Bearer tokens, and high-entropy strings from error messages before persisting |

### Worker Behavior

| Worker | Provider String | DB Table | `recordsSynced` Counts |
|---|---|---|---|
| `sync-claude-usage.worker.ts` | `"anthropic"` | `ProviderSyncRun` | 1 per `UsageDaily` row + 1 per `ModelUsageDaily` row written |
| `sync-claude-code.worker.ts` | `"claude_code"` | `ProviderSyncRun` | 1 per `ClaudeCodeDaily` row written |
| `sync-openai.worker.ts` | `"openai"` | `ProviderSyncRun` | 1 per `AiUsageDaily` row (model rows not counted separately) |
| `sync-github-copilot.worker.ts` | `"github_copilot"` | `ProviderSyncRun` | 1 (seat row) + 1 per user row |
| `sync-cursor.worker.ts` | `"cursor"` | `ProviderSyncRun` | 1 (seat row) + 1 per daily usage row |
| `sync-microsoft-copilot.worker.ts` | `"microsoft_copilot"` | `ProviderSyncRun` | 1 (seat row) + 1 per app row |

### Schema Fields Used

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Auto-generated |
| `organizationId` | `String` | Always scoped to the calling org |
| `provider` | `String` | One of: `anthropic`, `claude_code`, `openai`, `github_copilot`, `cursor`, `microsoft_copilot` |
| `status` | `String` | `"running"` → `"success"` or `"failed"` |
| `recordsSynced` | `Int` | Count of rows upserted in this run |
| `errorMessage` | `String?` | Null on success; sanitized error string (max 500 chars) on failure |
| `startedAt` | `DateTime` | Set at run creation |
| `finishedAt` | `DateTime?` | Set on complete or fail |

### Secret Sanitization

`sanitizeErrorMessage()` removes:
- `Bearer <token>` patterns
- Anthropic keys (`sk-ant-...`)
- GitHub tokens (`ghp_...`, `ghs_...`, `github_pat_...`)
- OpenAI keys (`sk-<20+ chars>`)
- Generic high-entropy strings (40+ chars of `[A-Za-z0-9\-_]`)

Any error message written to `ProviderSyncRun.errorMessage` is guaranteed to contain no API keys or secrets.

### Validation

All logging is verified by `scripts/validate-provider-integrations.ts` Test 9:
- Logger file exists and exports all 4 functions
- All 6 workers import the logger
- All 6 workers call `startSyncRun`, `completeSyncRun`, and `failSyncRun`
- All 6 workers pass the correct provider string to `startSyncRun`
- `sanitizeErrorMessage` strips Anthropic and GitHub token patterns

Run: `npm run validate:providers` — all 94 tests must pass.

---

## 9. Provider Sync History UI

### Where sync runs appear

Recent sync runs are visible at **Settings → Recent Sync Runs** (section 6 on the Settings page at `/settings`). The section is positioned between "Data Sync" and "Security".

### API route

`GET /api/providers/sync-runs`

- Requires session (calls `requireSession()`); scoped by `organizationId`
- Returns latest 50 runs by default; supports `?limit=N` (max 100) and `?provider=<key>` filter
- Computes `durationMs` from `startedAt` / `finishedAt` (or current elapsed for in-progress runs)
- Adds `isStale: true` and maps `status` → `"stale"` for any `"running"` run older than 30 minutes (does **not** mutate DB)
- Never returns `organizationId` or any secrets

### Fields shown in the table

| Column | Source | Notes |
|---|---|---|
| Provider | `provider` (mapped to display name) | e.g. `github_copilot` → "GitHub Copilot" |
| Status | `status` | Color-coded badge: Success (emerald), Failed (red), Running (cyan), Stale (amber) |
| Records | `recordsSynced` | `font-data` monospaced numeric |
| Started | `startedAt` | Relative time (e.g. "3m ago"), full datetime on hover |
| Duration | calculated `durationMs` | e.g. "1.2s", "3m 5s", "—" if null |
| Error / Message | `errorMessage` | Truncated at 80 chars for layout; full text on hover |

### Provider display-name mapping

| DB key | Display name |
|---|---|
| `anthropic` | Anthropic Claude |
| `claude_code` | Claude Code |
| `openai` | OpenAI |
| `github_copilot` | GitHub Copilot |
| `cursor` | Cursor |
| `microsoft_copilot` | Microsoft Copilot |

### Stale running detection

If a sync run has `status = "running"` and `startedAt` is more than 30 minutes ago, the API response sets `status: "stale"` and `isStale: true`. This renders an amber **Stale** badge in the UI, indicating the worker likely crashed or the server restarted mid-sync. No DB mutation occurs — the `ProviderSyncRun.status` column is left as `"running"` until the next sync overwrites it.

### How this helps real-key testing

When a real provider credential is added and Sync is clicked, the next page load (or the automatic refresh after sync) will show:
- Whether the sync run completed (`success`) or errored (`failed`)
- Exactly how many DB records were upserted (`recordsSynced`)
- The elapsed duration, which reveals slow API calls or pagination issues
- The sanitized error message for any failure, enabling rapid diagnosis without needing server logs

This makes the Settings page the first stop for real-key debugging before checking Prisma Studio or server logs.
