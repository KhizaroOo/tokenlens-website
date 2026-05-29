# CLAIMS_AND_COPY_GUARDRAILS.md

> Canonical list of what TokenLens marketing copy, sales decks, investor materials, and product surface text may and may not claim.
> Verified on **2026-05-28**.

If you are writing **any** customer-facing copy (web page, email, deck, in-product tooltip, README, social post), this file is binding.

---

## 1 · Provider support wording

| Provider | Approved external wording |
|---|---|
| Anthropic / Claude | "Live — full integration via Anthropic Admin API." |
| Claude Code | "Live — uses Anthropic Admin API credential." |
| OpenAI | "Connector implemented; production validation pending." |
| GitHub Copilot | "Connector implemented; production validation pending." |
| Cursor | "Connector implemented; production validation pending." |
| Microsoft 365 Copilot | "Connector implemented; production validation pending." |
| Gemini | "Limited — no aggregate admin usage API. Coverage requires GCP Billing Export." |
| Perplexity | "Limited — no aggregate admin usage API. Enterprise webhook audit logs only." |

**Catch-all caveat (use generously):** *"Provider coverage may vary by plan, API access, and customer environment."*

---

## 2 · Feature-availability wording

| Status | Approved phrase |
|---|---|
| 🟢 Live | "Available today." |
| 🟡 Implemented — needs verification | "Implementation present; production validation pending." |
| 🟠 Preview | "Preview — backend integration pending." |
| 🔵 Coming Soon | "Coming Soon." |
| ⚪ Planned | "On the roadmap." |
| 🚫 Limited / Not built | "Not currently supported." Or omit. |

---

## 3 · Allowed wording (✅ safe to use)

- "Multi-provider AI spend, usage, productivity, and governance intelligence."
- "AI cost dashboard." / "AI FinOps dashboard."
- "Unified view across major AI providers."
- "Provider coverage may vary by plan, API access, and customer environment."
- "Implementation present; production readiness may require validation."
- "Coming Soon." / "Roadmap." / "Preview." / "On the roadmap."
- "Encrypted credentials (AES-256-GCM)."
- "JWT-based session cookies (httpOnly, secure, 7-day expiry)."
- "Organization-scoped queries / per-org data isolation."
- "Role-based access (viewer / admin / owner)."
- "Metadata only — never prompt text, AI responses, or code content."
- "Audit-ready architecture." (architecture-level claim; do NOT claim the audit-logs UI is shipped)
- "Built on enterprise security principles."
- "Provider integrations may require admin-level API credentials."
- "Sync is scheduled, not real-time." (be explicit when asked)

---

## 4 · NOT allowed unless proven (❌ do not use)

### 4a · Certifications & compliance
- ❌ "SOC 2 certified" / "SOC 2 Type II" — **not held**.
- ❌ "ISO 27001 certified" — **not held**.
- ❌ "HIPAA compliant" — **not formally claimed**.
- ❌ "GDPR compliant" — **not formally claimed**.
- ❌ "FedRAMP" — not held.

### 4b · Customer proof
- ❌ "Trusted by [N] customers" — **none exist yet**.
- ❌ "Used by Fortune 500 / unicorn / hyperscaler" — **none exist yet**.
- ❌ Customer logos — **none exist yet**.
- ❌ Customer testimonials / quotes — **none exist yet**.
- ❌ Case studies — **none exist yet**.
- ❌ Star ratings, "G2 Leader" badges, etc. — **none exist yet**.

### 4c · Feature overclaims
- ❌ "Live sync across all 7 providers" / "All 8 providers syncing" — only Anthropic + Claude Code are verified.
- ❌ "Slack / Teams / PagerDuty alerts" as a shipped feature — **delivery not wired**.
- ❌ "Email alerts" / "SMS alerts" as shipped — **delivery not wired**.
- ❌ "Board-ready PDF reports" — **PDF export not built**.
- ❌ "One-click reclaim workflow" — **not built**.
- ❌ "Real-time" anything — **sync is scheduled, not real-time**.
- ❌ "Auto-remediation" / "Autopilot mode" — **not built**.
- ❌ "Natural-language query" / "AI assistant inside dashboard" — **not built**.
- ❌ "Forecasting" as a shipped feature — **only basic trend lines exist**.
- ❌ "Budget enforcement" (auto-block over-spend) — **only alerting is planned**.
- ❌ "SSO / SAML" as shipped — pricing page says "SSO / SAML-ready positioning"; the actual integration is on the roadmap.

### 4d · Numeric / outcome claims (unsourced)
- ❌ "Save 15-30%." / "Save 12-22%." / "Reduce spend by 25%."
- ❌ "5-minute setup." / "Deploy in under 10 minutes." (no benchmark)
- ❌ "10x faster than [competitor]." (no benchmark)
- ❌ "Recover [N]× ROI." (no customer data)
- ❌ Specific dollar amounts saved by hypothetical customers.

### 4e · Competitive
- ❌ Naming competitors negatively (e.g. "Unlike [Competitor], we…").
- ❌ Claiming feature parity with a named competitor without verification.
- ❌ "The only AI spend platform that…" — likely overclaim; verify uniqueness first.

### 4f · Future-tense as present
- ❌ "Our AI scoring engine identifies waste." — engine not built.
- ❌ "TokenLens auto-routes traffic to cheaper models." — not a product feature.
- ❌ "Our customers report…" — there are no customers to report yet.

---

## 5 · How to phrase the most common temptations

| Tempting (don't write) | Replace with (do write) |
|---|---|
| "Live across all 7 providers" | "Live Anthropic Admin API integration; additional connectors implemented, customer validation pending." |
| "Trusted by leading AI teams" | "Built for AI teams. (Currently in pilot.)" |
| "Save 20-30% on AI spend" | "Visibility to right-size every model and seat decision." |
| "SOC 2 certified" | "Built on enterprise security principles. Certifications on the roadmap." |
| "Real-time anomaly alerts" | "Threshold and anomaly-detection rules on the roadmap (Phase 2B)." |
| "One-click reclaim" | "Idle-seat reports with workflow guidance." |
| "Board-ready PDF reports" | "Executive views and exports on the roadmap." |
| "Used by Fortune 500s" | (omit) — or use "Built for AI-mature companies past the experimentation phase." |
| "G2 Leader" | (omit) |
| "Unlike [competitor]" | (omit competitor's name; focus on what we do) |

---

## 6 · Where guardrails apply (everywhere)

- Public website pages: `app/(marketing)/**`
- Dashboard tooltips, headers, empty states: `components/dashboard/**`, `app/(dashboard)/**`
- Marketing emails, drips, follow-ups
- Sales decks, investor decks
- Social media (LinkedIn, X, etc.)
- Press releases
- README and any internal doc that may be read externally
- Customer-facing release notes
- App store descriptions (if/when we have any)

---

## 7 · Internal review checklist (before publishing copy)

- [ ] Did I claim any certification we don't hold? (SOC 2, ISO 27001, HIPAA, GDPR, FedRAMP)
- [ ] Did I reference any specific customer / logo / testimonial / case study?
- [ ] Did I claim any feature that isn't shipped end-to-end?
- [ ] Did I attach a specific percentage or dollar saving without a source?
- [ ] Did I describe a non-Anthropic provider as "live" without saying "validation pending"?
- [ ] Did I describe alert delivery (Slack/Teams/Email/PagerDuty) as shipped?
- [ ] Did I describe PDF export or one-click reclaim as shipped?
- [ ] Did I use "real-time" anywhere?
- [ ] Did I name a competitor?

**If you answered "yes" to any of the above — revise before publishing.**

---

## 8 · Why this matters

Sophisticated buyers (CTOs, CFOs, FinOps leaders) will fact-check claims during a procurement cycle. They will:

- Ask for the SOC 2 report (if claimed).
- Ask for customer references (if "trusted by" is claimed).
- Ask to see the alert routing actually fire (if "alerts" is claimed).
- Ask for a benchmark methodology (if a savings percentage is claimed).

**Every unverifiable claim is a lost deal.** Every honest "Coming Soon" is a credibility deposit.
