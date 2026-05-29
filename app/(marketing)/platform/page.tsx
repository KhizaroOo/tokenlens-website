import type { Metadata } from "next";
import {
  BarChart3, Users, Building2, Cpu, GitBranch, DollarSign,
  Briefcase, ShieldCheck, AlertTriangle, FileBarChart, Settings2,
  Layers,
} from "lucide-react";
import {
  EditorialPageHero, ExhibitLabel, CreativeCTA,
} from "@/components/marketing/gallery";
import { SignalFlowDiagram } from "@/components/marketing/SignalFlowDiagram";

export const metadata: Metadata = {
  title: "Platform — TokenLens",
  description:
    "An atlas of twelve operating modules — covering AI users, teams, models, developer AI tools, LLM spend, business productivity AI, governance, alerts, and reports.",
};

const MODULES = [
  { num: "01", icon: BarChart3,   eyebrow: "EXECUTIVE LENS",       title: "Unified Dashboard",      tone: "signal"  as const, body: "Total AI spend, active users, provider mix, budget burn, usage trends — one executive view. Designed for the people who only have ten minutes between meetings." },
  { num: "02", icon: Users,       eyebrow: "IDENTITY MAP",         title: "AI Users",               tone: "lens"    as const, body: "Who is actually using AI. Who is dormant. Who is over-consuming. Who needs enablement. Mapped per user, per tool, per week." },
  { num: "03", icon: Building2,   eyebrow: "HEATMAP WALL",         title: "AI Teams",               tone: "anomaly" as const, body: "Per-team adoption, per-team cost, per-team velocity correlation. Compare engineering vs. product vs. support vs. operations." },
  { num: "04", icon: Cpu,         eyebrow: "COST SPECTRUM",        title: "AI Models",              tone: "budget"  as const, body: "Model-level cost, volume, provider concentration. Where you're paying GPT-4o for jobs that GPT-4o-mini could do at 17× cheaper." },
  { num: "05", icon: GitBranch,   eyebrow: "CODE SIGNAL RAIL",     title: "Developer AI Tools",     tone: "anomaly" as const, body: "Claude Code, GitHub Copilot, Cursor — seats vs. activity, acceptance rates, per-team productivity signals." },
  { num: "06", icon: DollarSign,  eyebrow: "CONSUMPTION WAVEFORM", title: "LLM / API Spend",        tone: "budget"  as const, body: "Claude, OpenAI, Gemini, Perplexity — token spend normalized into one waveform. By user, model, project, day." },
  { num: "07", icon: Briefcase,   eyebrow: "ADOPTION CONSTELLATION",title:"Business Productivity AI",tone: "lens"   as const, body: "Microsoft 365 Copilot — licensed seat count, per-app activity (Teams, Word, Excel, Outlook), last-activity date per user." },
  { num: "08", icon: ShieldCheck, eyebrow: "CONTROL GRID",         title: "Governance",             tone: "signal"  as const, body: "Budgets, alert rules, audit trails, provider policies. The compliance layer that doesn't slow engineering down." },
  { num: "09", icon: AlertTriangle,eyebrow: "HONEST LIMITS",       title: "Provider Limits",        tone: "budget"  as const, body: "An exhibit of what each provider API can and cannot expose. Honest about Gemini and Perplexity. No vendor-style overpromising." },
  { num: "10", icon: FileBarChart,eyebrow: "REPORTING ROOM",       title: "Reports & Alerts",       tone: "lens"    as const, body: "Scheduled executive reports. Threshold alerts. Anomaly detection. Delivered to Slack, Teams, email, PagerDuty, or PDF." },
  { num: "11", icon: Settings2,   eyebrow: "INSTRUMENT PANEL",     title: "Settings & Integrations",tone: "signal"  as const, body: "Encrypted credential storage. Per-provider sync controls. Role-based access. Organization-level scoping. Every knob, one place." },
  { num: "12", icon: Layers,      eyebrow: "NEW EXHIBITS",         title: "Connector Framework",    tone: "anomaly" as const, body: "Drop-in connector pattern absorbs new providers as their admin APIs ship. Designed for the AI tooling explosion, not against it." },
];

export default function PlatformPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 02"
        label="PLATFORM ATLAS"
        title={
          <>
            The complete <span className="italic font-light">operating lens</span> for
            company-wide AI.
          </>
        }
        lead="Twelve modules covering every angle of AI usage in your company — from per-user adoption to per-model cost to per-provider governance."
        kicker={"PLATFORM\n12 ARTIFACTS\n" + new Date().getFullYear()}
      />

      {/* Module grid */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="mb-10">
            <ExhibitLabel label="OPERATING MODULES" tone="signal" />
            <h2 className="mt-4 sg-display text-3xl lg:text-4xl text-[var(--sg-text)] max-w-3xl">
              Each module is a different artifact. <span className="italic font-light text-[var(--sg-text-mute)]">A different way to see AI inside your company.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-x-px gap-y-px bg-[var(--sg-line)] border sg-line">
            {MODULES.map(m => (
              <article key={m.num} className="bg-[var(--sg-bg)] p-7 lg:p-9 relative group hover:bg-[var(--sg-panel)] transition-colors">
                <div className="flex items-baseline justify-between mb-5">
                  <span className="sg-number text-4xl font-black text-[var(--sg-text)]">{m.num}</span>
                  <ExhibitLabel label={m.eyebrow} tone={m.tone} />
                </div>
                <m.icon className="h-6 w-6 text-[var(--sg-text)] mb-4 group-hover:translate-x-1 transition-transform" />
                <h3 className="sg-title text-2xl text-[var(--sg-text)]">{m.title}</h3>
                <p className="mt-3 text-[var(--sg-text-soft)] leading-relaxed">{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-12 lg:py-20 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="ARCHITECTURE" tone="lens" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl leading-[0.95]">
            Providers in. <span className="italic font-light">Intelligence out.</span>
          </h2>
          <p className="mt-4 text-base text-[var(--sg-text-soft)] leading-relaxed max-w-2xl">
            A single pipeline normalizes every provider API into a unified data model — so the dashboard works the same whether you have 2 providers or 20.
          </p>
          <div className="mt-10">
            <SignalFlowDiagram />
          </div>
        </div>
      </section>

      <CreativeCTA
        eyebrow="INSTALLATION 09 — PLATFORM"
        title="See the full atlas in twenty minutes."
        subtitle="Bring your provider mix. We'll show you exactly how each module would render against your real stack."
      />
    </>
  );
}
