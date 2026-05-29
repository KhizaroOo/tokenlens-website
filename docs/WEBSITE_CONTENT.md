# WEBSITE_CONTENT.md

> Public marketing website content inventory.
> Verified against the repo on **2026-05-28**.

---

## 0 · Signal Gallery theme — concept overview

| Aspect | Detail |
|---|---|
| Concept | Editorial museum / observatory — "every section is an exhibit; every metric is an artefact." |
| Scope | Applied via `.signal-gallery` class wrapper in `app/(marketing)/layout.tsx`. The dashboard portal does NOT use this theme. |
| Light mode | Warm off-white background (`#F7F2E8`), museum-black ink (`#10120E`). |
| Dark mode | Museum-black background (`#050505`), warm cream text (`#F4F1E8`). |
| Accent palette | Five tones (semantic): emerald (`signal`), cyan (`lens`), violet (`anomaly`), amber (`budget`), red (`risk`). |
| Type system | Plus Jakarta Sans (`sg-display`, `sg-title`, body), JetBrains Mono (`sg-number`, `sg-caption`, `sg-eyebrow`). |
| Visual motifs | Cross-hairs, orbit rings, eyebrow tags ("EXHIBIT 01 / LABEL"), corner ticks on panels, signal-line dividers. |
| Animations | CSS-only: `sg-pulse` (3.6s), `sg-orbit-slow` (80s), `sg-orbit-med` (48s). All disabled under `prefers-reduced-motion`. |
| Known divergence | `--sg-anomaly: #7C3AED` is violet, which conflicts with the global "never purple" rule. One of five accent tones; out of scope to swap without redesign. |

---

## 1 · Header / footer behaviour

### Header (`components/marketing/MarketingHeader.tsx`)

- Fixed-top, scroll-aware: transparent when at top, blurred panel when scrolled past 12px.
- Top status strip (desktop): "AI OPERATING LAYER · TOKENLENS · EXHIBIT IN ROTATION · LENS v2.1 · YYYY".
- Pill nav (desktop): Product, Solutions, Use Cases, Integrations, Pricing, Resources, Security.
- Right side: theme toggle (with `aria-label`), Login link, Book Demo button.
- Mobile: hamburger toggle (with `aria-label` + `aria-expanded`), full-screen sheet.

### Footer (`components/marketing/MarketingFooter.tsx`)

- Massive editorial wordmark "TokenLens" with "END OF EXHIBIT · scroll up to revisit".
- Provider dots strip listing all 8 providers.
- Final CTA panel — "The operating lens for company-wide AI."
- 4 link columns: Product · Solutions · Resources · Legal.
- Bottom strip: copyright + privacy/terms/security shortcuts.

---

## 2 · CTA strategy

| Section | Primary CTA | Secondary CTA |
|---|---|---|
| Header | Book Demo (→ `/demo`) | Login (→ `/login`) |
| Homepage hero | Book a Demo (→ `/demo`) | Explore Platform (→ `/platform`) |
| Most page bottoms (`CreativeCTA`) | Book Demo (→ `/demo`) | Explore Platform (→ `/platform`) |
| Pricing page final | Talk to Sales (→ `/contact`) | Book Demo (→ `/demo`) |
| Security page final | Talk to Sales (→ `/contact`) | Book Demo (→ `/demo`) |
| Integrations page final | Request integration (→ `/contact`) | Book Demo (→ `/demo`) |
| Footer final panel | Book Demo (→ `/demo`) | Explore Platform (→ `/platform`) |

---

## 3 · Per-page content inventory

### 3.1 · `/` — Homepage

| Field | Value |
|---|---|
| Purpose | First-impression page; convince a visitor of the category and offer in 10 seconds. |
| Primary message | "Control your company's AI spend before it becomes your next cloud bill." |
| Main sections | EXHIBIT 01 Hero (lens visual + KPIs) · Data Ribbon · EXHIBIT 02 Chaos Wall (representative scenarios) · EXHIBIT 03 Six Modules · EXHIBIT 04 Kinetic Preview (real dashboard screenshot) · EXHIBIT 05 Signal Flow · EXHIBIT 06 Before/After · EXHIBIT 07 Persona Lens · EXHIBIT 08 Governance · Manifesto · Final CTA |
| CTAs | Book a Demo, Explore Platform |
| Status | 🟢 Live |
| Known TODOs | None blocking. Could add an OG image and customer-logo strip *only once real customers exist*. |

### 3.2 · `/platform`

| Field | Value |
|---|---|
| Purpose | Atlas of the 12 operating modules. |
| Primary message | "The complete operating lens for company-wide AI." |
| Main sections | Editorial hero · Module grid (12 cards) · Architecture diagram · Final CTA |
| CTAs | Book Demo, Explore Platform |
| Status | 🟢 Live |
| Known TODOs | "Connector Framework" module 12 hints at future provider absorption — keep wording soft until validated. |

### 3.3 · `/solutions`

| Field | Value |
|---|---|
| Purpose | Persona-targeted views (CTO, CFO, FinOps, Eng Leaders, Platform, IT/Sec). |
| Primary message | "Same data. Six perspectives." |
| Main sections | Editorial hero · 6 persona cards (with anchor IDs `#cto`, `#cfo`, `#finops`, `#engineering`, `#platform`, `#it`) · Side-by-side table |
| CTAs | Book Demo |
| Status | 🟢 Live |
| Known TODOs | "Cadence" column in the table mentions WEEKLY/DAILY/QUARTERLY — verify all modules support those flows when shipping Phase 2B. |

### 3.4 · `/use-cases`

| Field | Value |
|---|---|
| Purpose | 12 concrete signal tiles — problem → solution → outcome. |
| Primary message | "Twelve signals. Twelve real problems we solve." |
| Main sections | Editorial hero · Signal-type legend · 12 tiles (each with problem / solution / outcome) · Final CTA |
| CTAs | Book Demo |
| Status | 🟢 Live |
| Known TODOs | Outcomes were softened to remove unsourced percentages — keep qualitative until customer case studies exist. |

### 3.5 · `/integrations`

| Field | Value |
|---|---|
| Purpose | Provider coverage page with honest status. |
| Primary message | "Bring your AI stack into one view." |
| Main sections | Editorial hero · Provider Constellation (3 rings) · LLM/API providers (4) · Developer AI (3) · Business AI (1 + "more soon") · Curator's Note (disclaimer) · Final CTA |
| CTAs | Request integration, Book Demo |
| Status | 🟢 Live |
| Known TODOs | Provider status labels currently say "Available / In Progress / Limited" — keep until production validation lands. |

### 3.6 · `/pricing`

| Field | Value |
|---|---|
| Purpose | Tier overview without committing to a number. |
| Primary message | "Predictable pricing for predictable AI spend." |
| Main sections | Editorial hero · 3 Plinth cards (Starter, Growth, Enterprise) · FAQ accordion · Final CTA |
| CTAs | Book Demo, Talk to Sales |
| Status | 🟢 Live |
| Known TODOs | No published price points yet — "Custom pricing — scales with providers + seats". Decide on public price tiers before paid launch. |

### 3.7 · `/security`

| Field | Value |
|---|---|
| Purpose | Trust-building security overview. |
| Primary message | "Built with enterprise security principles." |
| Main sections | Editorial hero · 8 Security Trust Panels · Never-stored list · FAQ accordion · Final CTA |
| CTAs | Talk to Sales, Book Demo |
| Status | 🟢 Live |
| Known TODOs | SOC 2 / ISO 27001 question already answered honestly ("certifications are a process that takes time"). Update when certifications are actually issued. |

### 3.8 · `/resources`

| Field | Value |
|---|---|
| Purpose | Future-state content library. |
| Primary message | "The AI spend & governance reading list." |
| Main sections | Editorial hero · 6 format chips · 6 article preview cards (COMING SOON badges) · "LIBRARY IN CURATION" disclosure · Final CTA |
| CTAs | Contact us, Book Demo |
| Status | 🟠 Preview |
| Known TODOs | Build MDX/blog collection at `/resources/[slug]`. Until then, articles must remain labelled COMING SOON. |

### 3.9 · `/about`

| Field | Value |
|---|---|
| Purpose | Manifesto + product values. |
| Primary message | "AI moved faster than the dashboards built for it." |
| Main sections | Editorial hero · Mission + "Why now" split · 6 product values · Audience callout · Final CTA |
| CTAs | Book Demo |
| Status | 🟢 Live |
| Known TODOs | No founder/team page yet. Decide if that's needed for fundraising/investor stage. |

### 3.10 · `/contact`

| Field | Value |
|---|---|
| Purpose | Inbound contact form + direct email channels. |
| Primary message | "Talk to the TokenLens team." |
| Main sections | Hero · 3 inquiry-channel cards (sales/support/partnerships with mailto) · Form (live) with honeypot + state machine (idle/submitting/success/error) |
| CTAs | Send message → `/api/contact`, mailto fallback footnote |
| Status | 🟢 Live |
| Known TODOs | Wire an email-delivery provider so submissions also notify sales by email (today they only persist to Postgres). |

### 3.11 · `/demo`

| Field | Value |
|---|---|
| Purpose | Demo booking entry. |
| Primary message | "See TokenLens applied to your AI stack." |
| Main sections | Hero (with `DashboardMockup` screenshot) · 6-item demo agenda · Schedule form (live) — captures `preferredTime` + `companySize` + honeypot |
| CTAs | Request Demo → `/api/demo-request`, mailto fallback to `sales@tokenlens.io?subject=Demo%20request` |
| Status | 🟢 Live |
| Known TODOs | Wire a calendar provider (Cal.com / Calendly / Google Calendar) so demos auto-book based on `preferredTime`. Until then, sales contacts manually. |

### 3.12 · `/privacy`

| Field | Value |
|---|---|
| Purpose | Privacy policy. |
| Primary message | "How TokenLens collects, uses, and protects information." |
| Main sections | 7 sections: collection, use, provider data, security, retention, customer rights, contact |
| CTAs | None |
| Status | 🟢 Live |
| Known TODOs | Get legal review before public launch. Update LAST_UPDATED when amended. |

### 3.13 · `/terms`

| Field | Value |
|---|---|
| Purpose | Terms of service. |
| Primary message | "Terms governing use of TokenLens." |
| Main sections | 7 sections: use, customer responsibilities, account access, provider integrations, acceptable use, limitations, contact |
| CTAs | None |
| Status | 🟢 Live |
| Known TODOs | Get legal review. Replace "as-available basis" wording with the formal MSA before signing enterprise customers. |

---

## 4 · Light / dark mode handling

| Aspect | Implementation |
|---|---|
| Library | `next-themes` |
| Class strategy | `class="dark"` on `<html>` |
| Trigger | Theme toggle in header (Sun / Moon icons) |
| Default | System preference (with hydration-safe mount flag in header + dashboard mockup) |
| Marketing palette | All 5 accent tones have separate light + dark variants in `globals.css` under `.signal-gallery` and `.dark .signal-gallery` |
| Dashboard screenshots | Theme-aware swap between `dashboard-light.png` and `dashboard-dark.png` |

---

## 5 · Known public-launch blockers (website)

1. Wire `/api/contact` and `/api/demo-request`.
2. Wire `/api/auth/signup`.
3. Generate `robots.txt`, `sitemap.xml`.
4. Add an OG image (1200×630 PNG).
5. Publish 2-3 real articles before removing the COMING SOON badges from `/resources`.
6. Confirm legal review on `/privacy` and `/terms`.
