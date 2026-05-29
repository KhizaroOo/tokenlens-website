import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import {
  ArrowUpRight, AlertTriangle, Wallet, Eye, Layers, Users,
  Cpu, GitBranch, DollarSign, ShieldCheck, BarChart3, Activity,
} from "lucide-react";
import {
  ExhibitLabel, MuseumCaption, KineticMetricCard,
  CreativeCTA, DataRibbon, SignalLine,
} from "@/components/marketing/gallery";
import { LensHeroVisual } from "@/components/marketing/LensHeroVisual";
import { DashboardMockup } from "@/components/marketing/DashboardMockup";
import { SignalFlowDiagram } from "@/components/marketing/SignalFlowDiagram";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TokenLens — The operating lens for company-wide AI spend",
  description:
    "Control your company's AI spend before it becomes your next cloud bill. TokenLens turns scattered AI usage across Claude, OpenAI, GitHub Copilot, Cursor, Microsoft Copilot, and more into one operating layer.",
  keywords: [
    "AI spend", "AI cost management", "AI FinOps", "AI governance",
    "Claude usage", "OpenAI usage", "GitHub Copilot analytics",
    "Cursor analytics", "Microsoft Copilot analytics",
    "AI dashboard", "multi-provider AI", "AI ROI",
  ],
  openGraph: {
    title: "TokenLens — One operating lens for company-wide AI",
    description:
      "Cost, adoption, productivity, and governance — across every AI provider — in one editorial dashboard.",
    type: "website",
    siteName: "TokenLens",
    // OG image is auto-wired by `app/opengraph-image.tsx` (Next.js file convention).
    // Per-page overrides live in their own opengraph-image.tsx siblings.
  },
  twitter: {
    card: "summary_large_image",
    title: "TokenLens — One operating lens for company-wide AI",
    description:
      "Cost, adoption, productivity, governance — across every AI provider.",
  },
};

export default function Home() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 01 — HERO
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-8 lg:pt-12 pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          {/* Top label strip */}
          <div className="flex items-center justify-between mb-10 lg:mb-16">
            <ExhibitLabel index="EXHIBIT 01" label="AI OPERATING LAYER" tone="signal" />
            <span className="sg-caption text-[var(--sg-text-mute)] hidden md:block">
              SIGNAL GALLERY · {new Date().getFullYear()}
            </span>
          </div>

          {/* Hero grid */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Headline column */}
            <div className="lg:col-span-7 relative">
              <h1 className="sg-display text-[3rem] sm:text-[4rem] lg:text-[5.5rem] xl:text-[6.5rem] text-[var(--sg-text)] leading-[0.92]">
                Control your
                <br />
                company&apos;s{" "}
                <span className="italic font-light tracking-tight" style={{ color: "var(--sg-signal)" }}>
                  AI spend
                </span>
                <br />
                before it becomes
                <br />
                <span className="text-[var(--sg-text-mute)] line-through decoration-[1px] decoration-[var(--sg-risk)]/40">
                  your next cloud bill.
                </span>
              </h1>
              <p className="mt-8 text-base lg:text-lg text-[var(--sg-text-soft)] max-w-xl leading-relaxed">
                TokenLens turns scattered AI usage across Claude, OpenAI, GitHub Copilot, Cursor,
                Microsoft Copilot, and more into one visual operating layer for spend, adoption,
                productivity, and governance.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--sg-ink)] text-[var(--sg-bg)] font-semibold text-sm hover:bg-[var(--sg-signal)] hover:text-[#050505] transition-colors"
                >
                  Book a Demo
                  <ArrowUpRight className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Link>
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border sg-line text-[var(--sg-text)] font-semibold text-sm hover:border-[var(--sg-ink)]/40 transition-colors"
                >
                  Explore Platform
                </Link>
              </div>

              {/* Headline meta — like a museum card */}
              <div className="mt-12 grid grid-cols-2 gap-6 border-t sg-line pt-6">
                <MuseumCaption
                  meta="MEDIUM"
                  title="One unified operating dashboard"
                  subtitle="Editorial multi-provider intelligence layer."
                />
                <MuseumCaption
                  meta="ON DISPLAY"
                  title="Spend · Adoption · Governance · ROI"
                  subtitle="One operating layer across every connected provider."
                />
              </div>
            </div>

            {/* Lens column */}
            <div className="lg:col-span-5 relative">
              <LensHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DATA RIBBON — instrumented readout
          ═══════════════════════════════════════════════════════════════════ */}
      <DataRibbon
        items={[
          { label: "MTD",       value: "$48,210",  tone: "budget" },
          { label: "USERS",     value: "428",      tone: "signal" },
          { label: "PROVIDERS", value: "7 / 8",    tone: "lens"   },
          { label: "TOKENS",    value: "412M",     tone: "signal" },
          { label: "TEAMS",     value: "34",       tone: "anomaly"},
          { label: "OPTIMIZE",  value: "18%",      tone: "anomaly"},
          { label: "ANOMALIES", value: "14 (30D)", tone: "budget" },
          { label: "BUDGET VIS",value: "91%",      tone: "signal" },
        ]}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 02 — AI SPEND CHAOS WALL
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <ExhibitLabel index="EXHIBIT 02" label="AI SPEND CHAOS" tone="risk" />
              <h2 className="mt-6 sg-display text-4xl lg:text-6xl text-[var(--sg-text)] leading-[0.95]">
                Scattered.
                <br />
                Invisible.
                <br />
                <span className="text-[var(--sg-risk)]">Unaccountable.</span>
              </h2>
            </div>
            <div className="lg:col-span-7 lg:pt-10">
              <p className="text-base lg:text-lg text-[var(--sg-text-soft)] leading-relaxed max-w-xl">
                AI tools are everywhere — Claude, OpenAI, Copilot, Cursor, M365 — but each one ships its
                own dashboard, its own pricing model, its own admin console. Leadership has no unified
                view of cost, adoption, or governance.
              </p>
              <p className="mt-4 sg-caption text-[var(--sg-text-mute)]">— REPRESENTATIVE FINANCE-TEAM SCENARIOS · ILLUSTRATIVE NUMBERS —</p>
            </div>
          </div>

          {/* Chaos wall — irregular fragments */}
          <div className="relative grid grid-cols-12 gap-3 lg:gap-4">
            <ChaosFragment col="col-span-12 sm:col-span-6 lg:col-span-4 rotate-[-1deg]"
              icon={Wallet} tone="risk" big="$11,840"
              caption="OpenAI invoice — last month"
              text="Spend exceeded budget by 42%. Nobody noticed until billing day."
            />
            <ChaosFragment col="col-span-6 sm:col-span-3 lg:col-span-3 rotate-[1deg] mt-6"
              icon={Eye} tone="anomaly" big="?"
              caption="Shadow AI usage"
              text="Three teams pay for Cursor licenses outside of IT."
            />
            <ChaosFragment col="col-span-6 sm:col-span-3 lg:col-span-5 rotate-[-0.5deg]"
              icon={AlertTriangle} tone="budget" big="4× spike"
              caption="Token burst — Cursor team-A"
              text="Anomalous traffic in last 24h. No alert raised."
            />
            <ChaosFragment col="col-span-12 sm:col-span-6 lg:col-span-5 rotate-[0.5deg] mt-3"
              icon={Layers} tone="risk" big="63 idle seats"
              caption="GitHub Copilot — Q1 audit"
              text="Inactive users still on $19/month plan. $1,197/mo of waste."
            />
            <ChaosFragment col="col-span-6 lg:col-span-3 rotate-[-1deg] mt-6"
              icon={Cpu} tone="anomaly" big="GPT-4o"
              caption="Default model"
              text="60% of traffic could run on 4o-mini at 17× cheaper."
            />
            <ChaosFragment col="col-span-6 lg:col-span-4 rotate-[1deg]"
              icon={Users} tone="lens" big="No allocation"
              caption="Per-team chargeback"
              text="Finance has no per-business-unit AI cost view."
            />
          </div>

          {/* Pulled into lens */}
          <div className="mt-16 relative border-t-2 border-[var(--sg-ink)] pt-10">
            <p className="sg-caption text-[var(--sg-text-mute)] text-center mb-6">— ALL OF IT, FOCUSED THROUGH ONE LENS —</p>
            <div className="flex items-center justify-center gap-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--sg-signal)] to-[var(--sg-signal)]" />
              <div className="relative">
                <div className="absolute inset-0 sg-lens-aura blur-2xl" />
                <div className="relative h-16 w-16 border-2 border-[var(--sg-ink)] rounded-full grid place-items-center bg-[var(--sg-bg)]">
                  <div className="h-3 w-3 rounded-full bg-[var(--sg-signal)]" />
                </div>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--sg-signal)] to-[var(--sg-signal)]" />
            </div>
            <p className="text-center sg-display text-2xl lg:text-3xl text-[var(--sg-text)] mt-6">TokenLens</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 03 — SIX EXHIBITS (PRODUCT MODULES)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
            <div className="lg:col-span-7">
              <ExhibitLabel index="EXHIBIT 03" label="OPERATING MODULES" tone="signal" />
              <h2 className="mt-6 sg-display text-4xl lg:text-6xl text-[var(--sg-text)] leading-[0.95]">
                Six modules.
                <br />
                <span className="italic font-light">One operating dashboard.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <p className="text-base text-[var(--sg-text-soft)] leading-relaxed max-w-md lg:ml-auto">
                Each module is a different artifact — a different way to see AI inside your company.
                Together they form the operating layer.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--sg-line)] border sg-line">
            {[
              { i: "01", icon: BarChart3,    label: "EXECUTIVE",  title: "Unified Dashboard",       desc: "Total AI spend, active users, provider mix, budget burn, trends — one view.",          tone: "var(--sg-signal)"  },
              { i: "02", icon: Users,        label: "ADOPTION",   title: "AI Users & Teams",         desc: "Who actually uses AI. Who's dormant. Who's over-consuming. By team and user.",         tone: "var(--sg-lens)"    },
              { i: "03", icon: Cpu,          label: "MODELS",     title: "AI Models",                desc: "Model-level cost, volume, provider concentration. Spot optimization opportunities.",  tone: "var(--sg-anomaly)" },
              { i: "04", icon: GitBranch,    label: "DEV TOOLS",  title: "Developer AI Tools",       desc: "Track Claude Code, GitHub Copilot, Cursor adoption + acceptance per eng team.",      tone: "var(--sg-budget)"  },
              { i: "05", icon: DollarSign,   label: "API SPEND",  title: "LLM & API Spend",          desc: "Monitor Claude, OpenAI, Gemini, Perplexity token spend in one normalized view.",     tone: "var(--sg-signal)"  },
              { i: "06", icon: ShieldCheck,  label: "GOVERNANCE", title: "Governance & Alerts",      desc: "Budgets. Anomaly rules. Audit trails. Provider policies. Reports.",                  tone: "#6366F1"           },
            ].map(m => (
              <article key={m.i} className="bg-[var(--sg-bg)] p-7 lg:p-8 relative group hover:bg-[var(--sg-panel)] transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <span className="sg-number text-3xl font-black text-[var(--sg-text)]">{m.i}</span>
                  <span className="sg-caption" style={{ color: m.tone }}>{m.label}</span>
                </div>
                <m.icon className="h-6 w-6 text-[var(--sg-text)] mb-4 group-hover:translate-x-1 transition-transform" />
                <h3 className="sg-title text-xl text-[var(--sg-text)] mb-3">{m.title}</h3>
                <p className="text-sm text-[var(--sg-text-soft)] leading-relaxed">{m.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 04 — KINETIC DASHBOARD PREVIEW
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-4">
              <ExhibitLabel index="EXHIBIT 04" label="KINETIC PREVIEW" tone="lens" />
              <h2 className="mt-6 sg-display text-4xl lg:text-5xl text-[var(--sg-text)]">
                What it actually looks like.
              </h2>
              <p className="mt-5 text-[var(--sg-text-soft)] leading-relaxed">
                A working dashboard, not a marketing render. Built for the people who actually open it Monday morning.
              </p>
              <SignalLine label="ARTIFACT 001 / 008" />
              <div className="space-y-5">
                <KineticMetricCard label="MTD AI SPEND"      value="$48,210" sublabel="7 providers" trend="+8.2%"   tone="budget"  />
                <KineticMetricCard label="ACTIVE USERS"      value="428"     sublabel="of 612 licensed" trend="+12" tone="signal"  />
                <KineticMetricCard label="OPTIMIZATION OPP." value="18%"     sublabel="$8,700 reclaimable" trend="↑" tone="anomaly" />
              </div>
            </div>
            <div className="lg:col-span-8">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 05 — SIGNAL FLOW
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="mb-10">
            <ExhibitLabel index="EXHIBIT 05" label="HOW IT WORKS" tone="signal" />
            <h2 className="mt-6 sg-display text-4xl lg:text-6xl text-[var(--sg-text)] leading-[0.95] max-w-3xl">
              From provider keys to ROI in <span className="italic font-light">six signals.</span>
            </h2>
          </div>
          <SignalFlowDiagram />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 06 — BEFORE / AFTER
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel index="EXHIBIT 06" label="BEFORE / AFTER" tone="anomaly" />
          <h2 className="mt-6 sg-display text-4xl lg:text-6xl text-[var(--sg-text)] mb-12 max-w-3xl leading-[0.95]">
            From <span className="italic font-light text-[var(--sg-risk)]">noise</span> to <span className="italic font-light text-[var(--sg-signal)]">clarity.</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-px bg-[var(--sg-line)] border sg-line">
            {/* Before */}
            <div className="bg-[var(--sg-bg)] p-8 lg:p-10">
              <p className="sg-caption text-[var(--sg-risk)]">BEFORE</p>
              <h3 className="sg-display text-2xl text-[var(--sg-text)] mt-2 mb-6">Fragmented AI Noise</h3>
              <ul className="space-y-3">
                {[
                  "Pulling 6 CSVs every month from 6 different consoles",
                  "No idea which teams or users are driving spend",
                  "Finance gets surprised on invoice day",
                  "No alerts when usage spikes 3× overnight",
                  "Idle Copilot/Cursor seats keep auto-renewing",
                  "No board-ready answer to 'is our AI budget working?'",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm text-[var(--sg-text-mute)]">
                    <span aria-hidden className="mt-2 h-px w-4 bg-[var(--sg-risk)] flex-shrink-0" />
                    <span className="line-through decoration-[1px] decoration-[var(--sg-risk)]/40">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="relative bg-[var(--sg-bg)] p-8 lg:p-10">
              <span aria-hidden className="absolute -top-px -left-px h-2 w-16 bg-[var(--sg-signal)]" />
              <p className="sg-caption text-[var(--sg-signal)]">AFTER</p>
              <h3 className="sg-display text-2xl text-[var(--sg-text)] mt-2 mb-6">Operational AI Clarity</h3>
              <ul className="space-y-3">
                {[
                  "One live dashboard across every provider",
                  "Per-team, per-user, per-model cost attribution",
                  "Spend forecasts and budget burn-down in real time",
                  "Anomaly alerts the same day a spike happens",
                  "Idle-seat reports + one-click reclaim workflow",
                  "Quarterly AI ROI report — board-ready PDF",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm text-[var(--sg-text)]">
                    <span aria-hidden className="mt-2 h-px w-4 bg-[var(--sg-signal)] flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 07 — PERSONAS / LENS VIEWS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 mb-12 items-end">
            <div className="lg:col-span-7">
              <ExhibitLabel index="EXHIBIT 07" label="VIEWS THROUGH THE LENS" tone="lens" />
              <h2 className="mt-6 sg-display text-4xl lg:text-6xl text-[var(--sg-text)] leading-[0.95]">
                Same data.
                <br />
                <span className="italic font-light">Six perspectives.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-[var(--sg-text-soft)] leading-relaxed">
                Every stakeholder sees their own layer of the operating dashboard — without leaving it.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--sg-line)] border sg-line">
            {[
              { role: "CTO",         lens: "ADOPTION + ARCHITECTURE", icon: Cpu,         headline: "Adoption visibility, provider control.",       quote: "See which teams have AI, which don't, where rollout is stalling.", tone: "var(--sg-signal)"  },
              { role: "CFO",         lens: "SPEND + FORECAST",        icon: DollarSign,  headline: "Predictable spend. No invoice surprises.",     quote: "Allocate AI cost to business units. No more invoice surprises.",   tone: "var(--sg-budget)"  },
              { role: "FINOPS",      lens: "ALLOCATION + WASTE",      icon: BarChart3,   headline: "Treat AI cost like AWS cost.",                  quote: "Forecasts, allocation, waste detection — all in one place.",       tone: "var(--sg-lens)"    },
              { role: "ENG LEADERS", lens: "DEV ADOPTION",            icon: GitBranch,   headline: "Productivity, not vanity.",                     quote: "Copilot, Cursor, Claude Code — adoption + acceptance per team.",   tone: "var(--sg-anomaly)" },
              { role: "PLATFORM",    lens: "INTEGRATION + POLICY",    icon: Layers,      headline: "Run AI like internal platform.",                quote: "Credential rotation, role access, provider policy enforcement.",   tone: "#6366F1"           },
              { role: "IT / SEC",    lens: "AUDIT + COMPLIANCE",      icon: ShieldCheck, headline: "Audit-ready by default.",                       quote: "Tamper-evident audit log. Role-based access. SOC 2 evidence.",     tone: "var(--sg-signal)"  },
            ].map(p => (
              <article key={p.role} className="bg-[var(--sg-bg)] p-7 lg:p-8 hover:bg-[var(--sg-panel)] transition-colors group">
                <div className="flex items-center justify-between mb-5">
                  <p.icon className="h-5 w-5" style={{ color: p.tone }} />
                  <span className="sg-caption text-[var(--sg-text-mute)] text-[9px]">{p.lens}</span>
                </div>
                <p className="sg-caption" style={{ color: p.tone }}>{p.role}</p>
                <h3 className="sg-title text-xl text-[var(--sg-text)] mt-2">{p.headline}</h3>
                <p className="mt-3 text-sm text-[var(--sg-text-soft)] leading-relaxed italic">&ldquo;{p.quote}&rdquo;</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/solutions" className="inline-flex items-center gap-1.5 sg-caption text-[var(--sg-signal)] hover:text-[var(--sg-text)] transition-colors">
              SEE EVERY VIEW <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXHIBIT 08 — GOVERNANCE INSTRUMENT
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <ExhibitLabel index="EXHIBIT 08" label="GOVERNANCE INSTRUMENT" tone="anomaly" />
              <h2 className="mt-6 sg-display text-4xl lg:text-5xl text-[var(--sg-text)] leading-[0.95]">
                Catch runaway spend the <span className="italic font-light text-[var(--sg-risk)]">same day</span> it happens.
              </h2>
              <p className="mt-6 text-base text-[var(--sg-text-soft)] leading-relaxed max-w-md">
                Hard budgets per provider and team. Anomaly detection on token + cost.
                Alerts routed to Slack, Teams, email, or PagerDuty — the moment normal pattern breaks.
              </p>
              <ul className="mt-6 space-y-2.5 max-w-md">
                {[
                  "Per-provider monthly budget caps",
                  "Anomaly detection on token + cost volume",
                  "Inactive-seat alerts to reclaim license waste",
                  "Tamper-evident audit log for SOC 2 evidence",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm text-[var(--sg-text-soft)]">
                    <span aria-hidden className="mt-2 h-px w-4 bg-[var(--sg-signal)] flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alert stack */}
            <div className="lg:col-span-7 space-y-2">
              {[
                { tone: "var(--sg-budget)",  label: "BUDGET ALERT",  text: "OpenAI on track to exceed $12K monthly cap by $1.2K.",   when: "2 HRS AGO",  icon: AlertTriangle },
                { tone: "var(--sg-risk)",    label: "ANOMALY",       text: "Cursor team-A: 4× normal token usage in last 24h.",      when: "THIS AM",    icon: Activity      },
                { tone: "var(--sg-lens)",    label: "IDLE SEATS",    text: "12 inactive Copilot seats — $228/mo reclaim available.", when: "TODAY",      icon: Users         },
                { tone: "var(--sg-signal)",  label: "AUDIT EVENT",   text: "Anthropic credential rotated by admin@acme.com.",        when: "4 DAYS AGO", icon: ShieldCheck   },
              ].map((a, i) => (
                <div key={i} className="border sg-line bg-[var(--sg-panel)] p-5 flex items-start gap-4 relative group hover:border-[var(--sg-ink)]/30 transition-colors">
                  <span aria-hidden className="absolute -top-px -left-px h-1.5 w-12" style={{ background: a.tone }} />
                  <a.icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: a.tone }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="sg-caption" style={{ color: a.tone }}>{a.label}</span>
                      <span className="sg-caption text-[var(--sg-text-mute)]">{a.when}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--sg-text)]">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DIFFERENTIATION — manifesto block
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32 border-t border-[var(--sg-ink)] bg-[var(--sg-panel)]">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel index="MANIFESTO" label="WHY TOKENLENS" tone="signal" />
          <h2 className="mt-6 sg-display text-4xl lg:text-7xl text-[var(--sg-text)] leading-[0.92] max-w-5xl">
            Provider dashboards show <span className="italic font-light text-[var(--sg-text-mute)]">one piece</span> of the story.
            <br />
            <span className="italic font-light text-[var(--sg-signal)]">TokenLens shows the whole exhibit.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-base lg:text-lg text-[var(--sg-text-soft)] leading-relaxed">
            Not LLM observability. Not cloud cost management. Not seat management.
            The <em className="text-[var(--sg-text)] not-italic font-semibold">AI operating dashboard</em> —
            for cost, adoption, productivity, governance, across every provider in your stack.
          </p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-0 border sg-line divide-x divide-[var(--sg-line)] max-w-3xl">
            {[
              { v: "1", l: "DASHBOARD" },
              { v: "8", l: "PROVIDERS" },
              { v: "6", l: "MODULES" },
              { v: "0", l: "SPREADSHEETS" },
            ].map(s => (
              <div key={s.l} className="px-5 py-7 bg-[var(--sg-bg)]">
                <p className="sg-display text-4xl text-[var(--sg-text)]">{s.v}</p>
                <p className="sg-caption text-[var(--sg-text-mute)] mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <CreativeCTA
        eyebrow="INSTALLATION 09 — FINAL"
        title="Bring your AI stack into focus."
        subtitle="Twenty minutes. One operating lens. Your entire AI footprint in one editorial view."
      />
    </>
  );
}

// ─── Chaos fragment helper ────────────────────────────────────────────────────
function ChaosFragment({
  col, icon: Icon, big, caption, text, tone,
}: {
  col: string;
  icon: typeof Wallet;
  big: string;
  caption: string;
  text: string;
  tone: "risk" | "anomaly" | "budget" | "signal" | "lens";
}) {
  const accent = {
    risk:    "var(--sg-risk)",
    anomaly: "var(--sg-anomaly)",
    budget:  "var(--sg-budget)",
    signal:  "var(--sg-signal)",
    lens:    "var(--sg-lens)",
  }[tone];
  return (
    <div className={`${col} border sg-line bg-[var(--sg-panel)] p-5 relative hover:rotate-0 transition-transform duration-300`}>
      <span aria-hidden className="absolute -top-px -left-px h-1 w-1" style={{ background: accent }} />
      <span aria-hidden className="absolute -top-px -right-px h-1 w-1" style={{ background: accent }} />
      <span aria-hidden className="absolute -bottom-px -left-px h-1 w-1" style={{ background: accent }} />
      <span aria-hidden className="absolute -bottom-px -right-px h-1 w-1" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-2 mb-3">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        <span className="sg-caption text-[var(--sg-text-mute)] text-[9px]">{caption}</span>
      </div>
      <p className="sg-display text-2xl lg:text-3xl text-[var(--sg-text)] leading-none">{big}</p>
      <p className="mt-3 text-xs text-[var(--sg-text-soft)] leading-relaxed">{text}</p>
    </div>
  );
}
