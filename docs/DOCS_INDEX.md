# DOCS_INDEX.md

> Map of every TokenLens documentation file, organised by audience.
> Verified on **2026-05-28**.

---

## 1 · Source-of-truth hierarchy

Read in this order when you need ground truth:

1. **[`AI_CONTEXT.md`](../AI_CONTEXT.md)** — current state, tech stack, route inventory, provider matrix, engineering rules, GTM honesty rules. **If anything else contradicts this file, this file wins.**
2. **[`CLAUDE.md`](../CLAUDE.md)** — short behavioural guide for Claude Code sessions; points back to `AI_CONTEXT.md`.
3. **[`README.md`](../README.md)** — onboarding / public-facing setup.
4. **`docs/*`** — granular reference docs (this folder).
5. **Legacy `TOKENLENS_*.md`** at the repo root — **historical only, do not rely on**.

---

## 2 · All current docs

### Root

| File | Purpose |
|---|---|
| [`README.md`](../README.md) | Onboarding, quick start, deployment overview, feature snapshot |
| [`AI_CONTEXT.md`](../AI_CONTEXT.md) | **Source of truth for AI agents.** Current state of stack, routes, providers, rules |
| [`CLAUDE.md`](../CLAUDE.md) | Short behavioural guide for Claude Code sessions |
| [`AGENTS.md`](../AGENTS.md) | Legacy agent pointer (small; superseded by `CLAUDE.md`) |

### `docs/` folder (this directory)

| File | Purpose |
|---|---|
| [`DOCS_INDEX.md`](DOCS_INDEX.md) | This file |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Full system architecture diagram — layers, flows, DB schema map, API map, directory tree |
| [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Current readiness snapshot per domain |
| [`URL_INVENTORY.md`](URL_INVENTORY.md) | Every route, counted accurately, with status labels |
| [`FEATURE_MATRIX.md`](FEATURE_MATRIX.md) | Per-feature status + per-feature claim guidance |
| [`GTM_READINESS.md`](GTM_READINESS.md) | Go-to-market readiness assessment + launch blockers |
| [`CLAIMS_AND_COPY_GUARDRAILS.md`](CLAIMS_AND_COPY_GUARDRAILS.md) | Marketing language rules — what can and can't be claimed |
| [`WEBSITE_CONTENT.md`](WEBSITE_CONTENT.md) | Per-marketing-page content inventory + Signal Gallery theme reference |
| [`ROADMAP.md`](ROADMAP.md) | Phase plan — what's shipped, what's next, what's planned |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Hosting + deploy modes + smoke-test commands |
| [`ENVIRONMENT.md`](ENVIRONMENT.md) | Env-var reference, inspected from code |
| [`PROVIDER_SETUP_GUIDE.md`](PROVIDER_SETUP_GUIDE.md) | Pre-existing — credential walkthrough per provider |
| [`PHASE_2B_PROVIDER_FUNCTION_VALIDATION.md`](PHASE_2B_PROVIDER_FUNCTION_VALIDATION.md) | Pre-existing — Phase 2B provider validation spec |
| [`GITHUB_PAGES_DEPLOYMENT.md`](GITHUB_PAGES_DEPLOYMENT.md) | Pre-existing — GH Pages workflow (currently disabled) |

### Legacy root files (kept for history — do NOT rely on)

| File | Status |
|---|---|
| `TOKENLENS_COMPLETE.md` | Legacy snapshot (May 24). Superseded. |
| `TOKENLENS_FEATURES.md` | Legacy. Superseded by `docs/FEATURE_MATRIX.md`. |
| `TOKENLENS_HIGHLIGHTS.md` | Legacy. May contain unsupported claims. |
| `TOKENLENS_PROJECT_DOCUMENTATION.md` | Legacy. Superseded by `AI_CONTEXT.md`. |

If you read a claim in one of these, **verify against the current docs before propagating it**.

---

## 3 · Which doc is for which audience

### 🧑‍💻 Developers (onboarding & day-to-day)

1. [`README.md`](../README.md) — setup
2. [`AI_CONTEXT.md`](../AI_CONTEXT.md) §§1-3, 7, 8 — stack + schema + engineering rules
3. [`ENVIRONMENT.md`](ENVIRONMENT.md) — env vars
4. [`URL_INVENTORY.md`](URL_INVENTORY.md) — where everything lives
5. [`DEPLOYMENT.md`](DEPLOYMENT.md) — when shipping

### 🤖 AI agents (Claude Code sessions, automation)

1. **[`AI_CONTEXT.md`](../AI_CONTEXT.md)** first — always
2. [`CLAUDE.md`](../CLAUDE.md) — behavioural rules
3. [`FEATURE_MATRIX.md`](FEATURE_MATRIX.md) — what's safe to claim / change
4. [`CLAIMS_AND_COPY_GUARDRAILS.md`](CLAIMS_AND_COPY_GUARDRAILS.md) — never violate

### 📣 GTM team (sales, marketing, content)

1. [`GTM_READINESS.md`](GTM_READINESS.md) — what's ready, what's not
2. **[`CLAIMS_AND_COPY_GUARDRAILS.md`](CLAIMS_AND_COPY_GUARDRAILS.md)** — what can be said
3. [`WEBSITE_CONTENT.md`](WEBSITE_CONTENT.md) — per-page content reference
4. [`FEATURE_MATRIX.md`](FEATURE_MATRIX.md) — feature-level claim guidance
5. [`ROADMAP.md`](ROADMAP.md) — what to tease as "coming soon"

### ✅ QA team

1. [`URL_INVENTORY.md`](URL_INVENTORY.md) — exhaustive route list to test
2. [`FEATURE_MATRIX.md`](FEATURE_MATRIX.md) — what status each feature should report
3. [`DEPLOYMENT.md`](DEPLOYMENT.md) §12 — smoke-test commands
4. [`PROJECT_STATUS.md`](PROJECT_STATUS.md) — current known issues

### 🚀 Deployment / DevOps

1. [`DEPLOYMENT.md`](DEPLOYMENT.md) — modes, hosts, build commands
2. [`ENVIRONMENT.md`](ENVIRONMENT.md) — required env vars
3. [`PROJECT_STATUS.md`](PROJECT_STATUS.md) §11 — current deploy state
4. [`AI_CONTEXT.md`](../AI_CONTEXT.md) §13 — what not to break

### 👥 Stakeholders / investors

1. [`README.md`](../README.md) — high-level snapshot
2. [`PROJECT_STATUS.md`](PROJECT_STATUS.md) — readiness scorecard
3. [`ROADMAP.md`](ROADMAP.md) — phase plan
4. [`GTM_READINESS.md`](GTM_READINESS.md) — launch readiness assessment

---

## 4 · Maintenance rules

| When this happens | Update this doc |
|---|---|
| New marketing page added/removed | `URL_INVENTORY.md`, `WEBSITE_CONTENT.md`, `FEATURE_MATRIX.md` |
| New dashboard route added/removed | `URL_INVENTORY.md`, `FEATURE_MATRIX.md`, `AI_CONTEXT.md` §11 |
| New API route added/removed | `URL_INVENTORY.md` §3, `FEATURE_MATRIX.md`, `AI_CONTEXT.md` §4 |
| Provider graduates from 🟡 to 🟢 | `AI_CONTEXT.md` §5, `PROJECT_STATUS.md` §7, `FEATURE_MATRIX.md`, `CLAIMS_AND_COPY_GUARDRAILS.md` §1, `ROADMAP.md` Phase 2B-a |
| New env var added | `ENVIRONMENT.md`, `DEPLOYMENT.md` |
| Phase 2B feature ships | `ROADMAP.md`, `PROJECT_STATUS.md`, `FEATURE_MATRIX.md` |
| Marketing copy changes | `WEBSITE_CONTENT.md`; verify against `CLAIMS_AND_COPY_GUARDRAILS.md` |
| SOC 2 / cert issued | `CLAIMS_AND_COPY_GUARDRAILS.md` §4a, `AI_CONTEXT.md` §9, security page |
| New customer (first paying) | `GTM_READINESS.md`; **only then** can claim guardrails relax |
| Major Next.js / Prisma / React version bump | `AI_CONTEXT.md` §2, `README.md` "Tech stack" |

---

## 5 · How to verify a doc is still accurate

```bash
# Re-count routes
find app -name "page.tsx" | wc -l
find app/api -name "route.ts" | wc -l

# Check Next.js version
grep '"next"' package.json

# Find any "Next.js 15" mentions
grep -r "Next.js 15" *.md docs/ 2>/dev/null

# Find unsourced percentage claims
grep -rE "[0-9]+%-[0-9]+%|[0-9]+-[0-9]+%" *.md docs/ 2>/dev/null

# Find SOC 2 / fake-customer language
grep -riE "SOC 2|trusted by|customers? say" *.md docs/ 2>/dev/null
```

If any of those return a hit in a doc file (not a guardrail / status doc that explicitly calls it out), update the doc.
