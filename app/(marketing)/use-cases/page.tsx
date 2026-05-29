import type { Metadata } from "next";
import {
  Eye, Building2, Network, GitBranch, DollarSign, Briefcase, BellRing,
  TrendingUp, Users, Cpu, FileBarChart, Layers,
} from "lucide-react";
import {
  EditorialPageHero, SignalTile, CreativeCTA, ExhibitLabel,
} from "@/components/marketing/gallery";

export const metadata: Metadata = {
  title: "Use Cases — TokenLens Signal Library",
  description:
    "Twelve concrete signals TokenLens detects — AI spend, adoption, governance, productivity, and risk — each one a real customer-discovery problem.",
};

const SIGNALS = [
  { type: "COST"        as const, icon: Eye,        title: "AI Spend Visibility",         problem: "Spend scattered across 6+ provider consoles. No consolidated view.",                    solution: "One dashboard pulls cost from every provider into a normalized model.",          outcome: "Finance sees consolidated MTD AI spend within 24 hrs of connecting providers." },
  { type: "COST"        as const, icon: Building2,  title: "Team-Level Cost Allocation",  problem: "AI cost shows up as one line item — no team or business unit attribution.",          solution: "Map provider users to teams + tag spend at every level of the org chart.",      outcome: "CFOs allocate AI cost to cost centers the way they allocate cloud." },
  { type: "ADOPTION"    as const, icon: Network,    title: "Provider Usage Monitoring",   problem: "No idea if 7 AI tools all earn their keep, or if 2 of them are duplicates.",          solution: "Side-by-side provider comparison: cost, users, models, productivity outcomes.",   outcome: "Procurement renegotiates or consolidates with hard data, not vibes." },
  { type: "ADOPTION"    as const, icon: GitBranch,  title: "Developer AI Tool Adoption",  problem: "Are devs actually using the Copilot licenses we bought?",                              solution: "Adoption rates, acceptance rates, per-team activity from real admin API data.",   outcome: "Eng leaders drive enablement where adoption lags + reclaim idle seats." },
  { type: "COST"        as const, icon: DollarSign, title: "LLM / API Cost Optimization", problem: "Running expensive models for jobs that cheaper models would handle fine.",            solution: "Model cost breakdown per workload + suggestions to downgrade safely.",            outcome: "Right-size every model decision against cost, latency, and accuracy trade-offs." },
  { type: "ADOPTION"    as const, icon: Briefcase,  title: "Business Productivity AI",    problem: "Bought 500 M365 Copilot licenses — no idea if business users actually use them.",     solution: "Per-app activity (Teams, Word, Excel, Outlook) and license utilization.",         outcome: "IT reclaims unused seats before next renewal, with per-user activity to back it up." },
  { type: "GOVERNANCE"  as const, icon: BellRing,   title: "Budget Alerts & Governance",  problem: "Spend overruns discovered on invoice day, not the day they happen.",                 solution: "Threshold + anomaly rules with same-day Slack/Teams/PagerDuty alerts.",            outcome: "FinOps catches a runaway eval script in 4 hours, not 4 weeks." },
  { type: "PRODUCTIVITY"as const, icon: TrendingUp, title: "AI ROI Reporting",            problem: "Board asks 'is the AI budget working?' — nobody has the data.",                       solution: "Correlate AI spend to PR throughput, ticket velocity, output trends.",            outcome: "Quarterly board update includes real cost-per-PR and cost-per-ticket." },
  { type: "COST"        as const, icon: Users,      title: "Inactive Seat Detection",     problem: "Copilot/Cursor seats keep auto-renewing for users who haven't logged in for 60 days.",solution: "Automated idle-seat reports with reclaim workflow.",                              outcome: "Stop paying for seats nobody uses — with the activity data to justify reclaim." },
  { type: "PRODUCTIVITY"as const, icon: Cpu,        title: "Model Usage Optimization",    problem: "Default model is GPT-4o — but 60% of traffic is simple summarization.",               solution: "Per-workload model breakdown + tier-down suggestions.",                           outcome: "Right-size model selection without changing developer experience." },
  { type: "GOVERNANCE"  as const, icon: FileBarChart,title:"Executive AI Reporting",      problem: "No standard report format — every leadership cycle starts from scratch.",            solution: "Branded PDF + CSV exports with adoption, spend, ROI, and governance metrics.",    outcome: "Same report on the board pack on schedule, every quarter." },
  { type: "RISK"        as const, icon: Layers,     title: "Multi-Provider AI Management",problem: "Each new provider means a new console, a new API key, a new spreadsheet.",          solution: "Connector framework absorbs new providers as they ship admin APIs.",              outcome: "New AI tool? Same dashboard. No new spreadsheet, no new training." },
];

export default function UseCasesPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 04"
        label="SIGNAL LIBRARY"
        title={
          <>
            Twelve <span className="italic font-light">signals.</span>
            <br />
            Twelve <span className="italic font-light">real problems</span> we solve.
          </>
        }
        lead="Each tile is a problem from a real customer-discovery whiteboard. None of them require a six-month implementation."
        kicker={"USE CASES\n12 ARTIFACTS\n" + new Date().getFullYear()}
      />

      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          {/* Signal type legend */}
          <div className="flex flex-wrap items-center gap-5 mb-10 pb-5 border-b sg-line">
            <ExhibitLabel label="SIGNAL CLASSIFICATION" tone="signal" />
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--sg-budget)]" /><span className="sg-caption text-[var(--sg-text-soft)]">COST</span></span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--sg-signal)]" /><span className="sg-caption text-[var(--sg-text-soft)]">ADOPTION</span></span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--sg-anomaly)]" /><span className="sg-caption text-[var(--sg-text-soft)]">GOVERNANCE</span></span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--sg-lens)]" /><span className="sg-caption text-[var(--sg-text-soft)]">PRODUCTIVITY</span></span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--sg-risk)]" /><span className="sg-caption text-[var(--sg-text-soft)]">RISK</span></span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SIGNALS.map((s, i) => (
              <SignalTile
                key={s.title}
                signalType={s.type}
                icon={s.icon}
                title={s.title}
                problem={s.problem}
                solution={s.solution}
                outcome={s.outcome}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <CreativeCTA title="Pick a signal. See it in action." />
    </>
  );
}
