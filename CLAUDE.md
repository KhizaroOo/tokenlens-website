# CLAUDE.md — Quick-start for Claude Code sessions

> **Primary source of truth: [`AI_CONTEXT.md`](AI_CONTEXT.md).** Read that first.
> This file is the short behavioural guide for AI agents working in the repo.

---

## 1 · Read first

1. [`AI_CONTEXT.md`](AI_CONTEXT.md) — current state, tech stack, route inventory, provider readiness, engineering rules, GTM honesty rules.
2. [`docs/DOCS_INDEX.md`](docs/DOCS_INDEX.md) — map of all other docs.

If `AI_CONTEXT.md` and any older file disagree, **`AI_CONTEXT.md` wins**.

---

## 2 · Stack one-liner

Next.js **16.2.6** App Router · React 19.2.4 · TypeScript strict · Tailwind v4 · Prisma 5.22 (PostgreSQL) · JWT in `tl_session` cookie · Recharts + Lucide only.

There is **no** `middleware.ts`. Next.js 16 uses **`proxy.ts`** at the repo root.

---

## 3 · Hard "do not" rules

| Do not | Why |
|---|---|
| Expose dashboard routes publicly | `proxy.ts` allow-list controls this. See `AI_CONTEXT.md §3` before editing. |
| Skip `requireSession()` in any protected API route | Source of truth for data security. Filter every query by `organizationId`. |
| Store prompt text, AI responses, or code content | Privacy-by-design. Metadata only. |
| Use purple in the dashboard | Claude.ai's brand colour. Emerald + cyan only. |
| Use a chart lib other than Recharts | Locked-in chart system. Use `CHART_COLORS` from `lib/table-styles.ts`. |
| Use an icon lib other than Lucide React | Same reason. |
| Redesign the Signal Gallery marketing theme | Out of scope for any non-design task. |
| Change `next.config.ts` security headers | Production hardening. |
| Modify Phase 1 Prisma tables | Live data depends on them. New columns OK via migration; new tables OK; existing columns no. |

---

## 4 · GTM honesty rules

Full list: [`docs/CLAIMS_AND_COPY_GUARDRAILS.md`](docs/CLAIMS_AND_COPY_GUARDRAILS.md). Short version:

- **Never** claim SOC 2 / ISO 27001 (not held).
- **Never** add fake customers, logos, testimonials, certifications, or case studies.
- **Never** claim "live across all providers" — only Anthropic + Claude Code are verifiably live.
- **Never** claim "Slack/Teams/PagerDuty alerts shipped" — schema exists, delivery is not wired.
- **Never** claim specific savings percentages (e.g. "15-30%", "12-22%") — unsourced.
- **Never** claim "board-ready PDF reports" or "one-click reclaim" — not shipped.
- **OK to say:** "implementation present; production validation pending", "Coming Soon", "Roadmap", "Preview".

---

## 5 · Provider one-liner

| | Production-live | Implementation present, needs verification | Limited (no admin API) |
|---|---|---|---|
| Providers | Anthropic / Claude · Claude Code | OpenAI · GitHub Copilot · Cursor · Microsoft 365 Copilot | Gemini · Perplexity |

Full matrix: `AI_CONTEXT.md §5`.

---

## 6 · Route boundary one-liner

```
PUBLIC:     13 marketing + /login + /signup + /api/auth/login + /api/auth/logout + static
PROTECTED:  26 dashboard pages → 307→/login,  45 API routes → 401 JSON
```

Full inventory: [`docs/URL_INVENTORY.md`](docs/URL_INVENTORY.md).

---

## 7 · Commands

```bash
npm run dev             # http://localhost:3000
npm run build           # production build
npm run lint            # eslint
npx tsc --noEmit        # type check
npm run db:push         # push Prisma schema
npm run db:seed         # seed demo data (admin@tokenlens.ai / admin123)
npm run db:studio       # Prisma Studio
docker-compose up -d    # start PostgreSQL
```

---

## 8 · Common tasks → which docs to read

| Task | Read |
|---|---|
| Add a new portal page | `AI_CONTEXT.md §11`, `docs/URL_INVENTORY.md` |
| Add a new API route | `AI_CONTEXT.md §3, §8`, the `// API Route Pattern` block in AI_CONTEXT |
| Touch marketing copy | `docs/CLAIMS_AND_COPY_GUARDRAILS.md`, `docs/WEBSITE_CONTENT.md` |
| Add a new provider | `AI_CONTEXT.md §5`, `modules/providers/registry.ts`, `docs/PROVIDER_SETUP_GUIDE.md` |
| Plan a release | `docs/ROADMAP.md`, `docs/PROJECT_STATUS.md` |
| Deploy | `docs/DEPLOYMENT.md`, `docs/ENVIRONMENT.md` |
| Audit GTM readiness | `docs/GTM_READINESS.md` |
