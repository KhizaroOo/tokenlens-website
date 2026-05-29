import type { Metadata } from "next";
import { Compass, Layers, Users, ShieldCheck, BarChart3, Target } from "lucide-react";
import { EditorialPageHero, ExhibitLabel, CreativeCTA } from "@/components/marketing/gallery";

export const metadata: Metadata = {
  title: "About — TokenLens manifesto",
  description:
    "TokenLens exists because AI adoption moved faster than internal reporting, finance workflows, and governance processes.",
};

const VALUES = [
  { icon: Layers,      title: "Clarity over noise",                  body: "One dashboard with the right defaults. Drill-down when you need it, executive summary when you don't." },
  { icon: ShieldCheck, title: "Governance without slowing innovation",body: "Compliance + spend control should never make engineering teams slower. We design around that constraint." },
  { icon: Target,      title: "Provider-neutral intelligence",       body: "Not Claude. Not OpenAI. The layer above them — and always honest about what each API actually exposes." },
  { icon: BarChart3,   title: "Useful signals over vanity metrics",  body: "If a metric doesn't change a decision, we don't ship it. Every chart maps to an action a CFO or CTO can take." },
  { icon: Users,       title: "Built for leadership AND operators",  body: "The executive view is the easy part. The hard part is the per-team drill-down that actually drives change. We build both." },
  { icon: Compass,     title: "Honest about limits",                 body: "When a provider has no admin API, we say so. We don't fake live data with estimates and call it observability." },
];

export default function AboutPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 09"
        label="MANIFESTO"
        title={
          <>
            AI moved <span className="italic font-light">faster</span> than the
            <br />
            dashboards built for it.
          </>
        }
        lead="TokenLens exists because AI adoption moved faster than internal reporting, finance workflows, and governance processes. We're building the operating dashboard the AI era needs."
        kicker={"ABOUT\n6 VALUES\n" + new Date().getFullYear()}
      />

      {/* Mission split */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <ExhibitLabel label="MISSION" tone="signal" />
              <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] leading-[0.95]">
                Give every company one operating <span className="italic font-light">lens</span> for AI.
              </h2>
              <p className="mt-5 text-[var(--sg-text-soft)] leading-relaxed">
                Cost, adoption, productivity, governance — across every provider. So leadership can move fast on AI without flying blind on spend.
              </p>
            </div>
            <div>
              <ExhibitLabel label="WHY NOW" tone="anomaly" />
              <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] leading-[0.95]">
                The AI invoice is the <span className="italic font-light">new cloud invoice.</span>
              </h2>
              <p className="mt-5 text-[var(--sg-text-soft)] leading-relaxed">
                In 2018, AWS spend caught CFOs off-guard. In 2025, AI is doing the same — only faster, and with less observability built into provider consoles. The category that emerged for cloud needs to exist for AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 lg:py-20 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="PRODUCT PHILOSOPHY" tone="lens" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl">
            How we <span className="italic font-light">build TokenLens.</span>
          </h2>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--sg-line)] border sg-line">
            {VALUES.map((v, i) => (
              <article key={v.title} className="bg-[var(--sg-bg)] p-7 hover:bg-[var(--sg-panel)] transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <v.icon className="h-5 w-5 text-[var(--sg-text)]" />
                  <span className="sg-caption text-[var(--sg-text-mute)]">№ {String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="sg-title text-lg text-[var(--sg-text)]">{v.title}</h3>
                <p className="mt-3 text-sm text-[var(--sg-text-soft)] leading-relaxed">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="border-2 border-[var(--sg-ink)] p-10 lg:p-16 relative bg-[var(--sg-panel)]">
            <span aria-hidden className="absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-[var(--sg-signal)]" />
            <span aria-hidden className="absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-[var(--sg-signal)]" />
            <span aria-hidden className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-[var(--sg-signal)]" />
            <span aria-hidden className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-[var(--sg-signal)]" />

            <ExhibitLabel label="WHO IT'S FOR" tone="signal" />
            <h3 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl">
              Companies <span className="italic font-light">past the AI experimentation</span> phase.
            </h3>
            <p className="mt-6 text-base lg:text-lg text-[var(--sg-text-soft)] max-w-2xl leading-relaxed">
              If your AI spend is measured in thousands or millions per month — and lives across 5+ providers — TokenLens is for you. If you&apos;re still on $200/month of API credits, you don&apos;t need us yet. Bookmark this page and come back.
            </p>
          </div>
        </div>
      </section>

      <CreativeCTA title="Want the same operating lens?" />
    </>
  );
}
