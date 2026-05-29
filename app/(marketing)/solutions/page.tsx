import type { Metadata } from "next";
import { Cpu, DollarSign, PieChart, GitBranch, Network, ShieldCheck } from "lucide-react";
import {
  EditorialPageHero, PersonaLensCard, CreativeCTA, ExhibitLabel,
} from "@/components/marketing/gallery";

export const metadata: Metadata = {
  title: "Solutions — TokenLens",
  description:
    "Six views through the lens — for CTOs, CFOs, FinOps, engineering leaders, AI platform teams, and IT / governance.",
};

const PERSONAS = [
  {
    anchor: "cto", role: "CTO", icon: Cpu,
    lens: "ADOPTION + ARCHITECTURE",
    headline: "Confidently scale AI across the company.",
    needs: [
      "Adoption visibility — who has AI, who doesn't, where rollout is stalling",
      "Provider control — one place to manage credentials + governance policies",
      "Team-level insights — per-team velocity correlation, not just spend",
      "AI rollout confidence — board-ready ROI numbers when budget questions come up",
    ],
  },
  {
    anchor: "cfo", role: "CFO", icon: DollarSign,
    lens: "SPEND + FORECAST",
    headline: "Predictable AI spend. No more invoice surprises.",
    needs: [
      "Budget visibility — month-to-date burn across every provider",
      "Cost allocation — tag AI spend to teams, projects, business units",
      "Waste detection — idle seats, over-provisioned models, stale API keys",
      "Predictable spend — forecasts and hard-cap alerts before billing day",
    ],
  },
  {
    anchor: "finops", role: "FinOps", icon: PieChart,
    lens: "ALLOCATION + WASTE",
    headline: "Treat AI cost the way you already treat AWS.",
    needs: [
      "Trend analysis — week-over-week, month-over-month, anomaly windows",
      "Provider comparison — $/token, $/active dev, $/PR across providers",
      "Budget ownership — per-team budgets that map to your cost-center model",
      "Reporting — scheduled CSV/PDF for monthly cost reviews",
    ],
  },
  {
    anchor: "engineering", role: "Engineering Leaders", icon: GitBranch,
    lens: "DEVELOPER ADOPTION",
    headline: "Productivity signals, not vanity metrics.",
    needs: [
      "Adoption per team — who's getting value, who needs enablement",
      "Acceptance rate — Copilot, Cursor, Claude Code per-developer signal",
      "Inactive seats — recover budget for new hires",
      "Tool comparison — is Copilot or Cursor better for your stack?",
    ],
  },
  {
    anchor: "platform", role: "AI Platform Teams", icon: Network,
    lens: "INTEGRATION + POLICY",
    headline: "Run AI like any other internal platform.",
    needs: [
      "Provider governance — credential rotation, role-based access, policy",
      "Integration readiness — drop-in connectors for new providers as they launch",
      "Usage analytics — see which internal teams adopt which capabilities",
      "Enablement reporting — show progress on AI platform OKRs",
    ],
  },
  {
    anchor: "it", role: "IT / Governance", icon: ShieldCheck,
    lens: "AUDIT + COMPLIANCE",
    headline: "Audit-ready AI governance out of the box.",
    needs: [
      "Security — encrypted credentials, organization-level data isolation",
      "Compliance — tamper-evident audit log of every admin action",
      "Access visibility — role-based access (viewer / admin / owner)",
      "Policy controls — provider allow/deny, budget caps, anomaly alerts",
    ],
  },
];

export default function SolutionsPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 03"
        label="VIEWS THROUGH THE LENS"
        title={
          <>
            Same data. <span className="italic font-light">Six perspectives.</span>
          </>
        }
        lead="Every stakeholder sees their own layer of the operating dashboard — without leaving it. Built for the people accountable for AI ROI."
        kicker={"SOLUTIONS\n6 LENS VIEWS\n" + new Date().getFullYear()}
      />

      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid md:grid-cols-2 gap-5">
            {PERSONAS.map(p => (
              <PersonaLensCard key={p.role} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Side-by-side table */}
      <section className="py-12 lg:py-20 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="SIDE BY SIDE" tone="signal" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl">
            What each role <span className="italic font-light">uses</span> TokenLens for.
          </h2>

          <div className="mt-12 border sg-line bg-[var(--sg-bg)] overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-[var(--sg-panel)] border-b sg-line">
                <tr>
                  {["ROLE","TOP QUESTION","KEY MODULE","CADENCE"].map(h => (
                    <th key={h} className="px-5 py-3 text-left sg-caption text-[var(--sg-text-mute)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { role: "CTO",      q: "Is our AI rollout actually working?",              m: "Unified Dashboard",       c: "WEEKLY" },
                  { role: "CFO",      q: "Are we on budget across providers?",               m: "LLM Spend + Budgets",     c: "DAILY + MONTHLY" },
                  { role: "FinOps",   q: "Where can we cut without throttling?",             m: "AI Models + Suggestions", c: "WEEKLY" },
                  { role: "Eng Lead", q: "Which teams get value from Copilot?",              m: "Developer AI Tools",      c: "SPRINT" },
                  { role: "Platform", q: "Are credentials secure and rotating on schedule?", m: "Settings + Audit",        c: "CONTINUOUS" },
                  { role: "IT/Sec",   q: "Can I prove compliance to auditors?",              m: "Audit Logs + Governance", c: "QUARTERLY" },
                ].map(r => (
                  <tr key={r.role} className="border-b sg-line-soft hover:bg-[var(--sg-panel)]/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-[var(--sg-text)]">{r.role}</td>
                    <td className="px-5 py-4 text-[var(--sg-text-soft)] italic">&ldquo;{r.q}&rdquo;</td>
                    <td className="px-5 py-4 text-[var(--sg-signal)]">{r.m}</td>
                    <td className="px-5 py-4 sg-caption text-[var(--sg-text-mute)]">{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CreativeCTA title="See your role's view of the lens." />
    </>
  );
}
