import type { Metadata } from "next";
import { BookOpen, FileText, Calculator, GitCompare, ListChecks, Wallet, GitBranch, Mic, Clock } from "lucide-react";
import { EditorialPageHero, ExhibitLabel, CreativeCTA } from "@/components/marketing/gallery";

export const metadata: Metadata = {
  title: "Library — TokenLens Resources",
  description:
    "Guides, calculators, reports, and comparisons for AI spend, governance, FinOps, and developer AI adoption.",
};

const FORMATS = [
  { icon: BookOpen,   label: "BLOG",        desc: "Short posts + product updates" },
  { icon: FileText,   label: "GUIDES",      desc: "Long-form how-tos" },
  { icon: Mic,        label: "REPORTS",     desc: "Annual research" },
  { icon: Calculator, label: "CALCULATOR",  desc: "AI spend estimator" },
  { icon: GitCompare, label: "COMPARISONS", desc: "Provider analysis" },
  { icon: ListChecks, label: "CHECKLISTS",  desc: "One-page playbooks" },
];

const ARTICLES = [
  { kind: "BLOG",       tone: "var(--sg-signal)",  title: "AI Spend Is Becoming the Next Cloud Bill",                   excerpt: "Five years ago AWS spend caught most CFOs off-guard. AI is on the same trajectory — only faster, with less observability.",  minutes: 8,  icon: Wallet      },
  { kind: "GUIDE",      tone: "var(--sg-lens)",    title: "How to Build an AI Usage Governance Program",                excerpt: "A 30-60-90 day playbook for setting AI policies, budgets, and audit trails across providers.",                              minutes: 14, icon: ListChecks  },
  { kind: "COMPARISON", tone: "var(--sg-anomaly)", title: "Claude vs OpenAI Spend Visibility",                          excerpt: "What each admin API actually exposes — and where you have to compute cost yourself.",                                       minutes: 11, icon: GitCompare  },
  { kind: "GUIDE",      tone: "#6366F1",           title: "Developer AI Tools: Adoption Metrics Eng Leaders Need",      excerpt: "Beyond Copilot seat count — acceptance rates, per-team adoption, and the metrics that predict ROI.",                       minutes: 12, icon: GitBranch   },
  { kind: "CHECKLIST",  tone: "var(--sg-budget)",  title: "AI FinOps Checklist for CFOs and CTOs",                      excerpt: "Twelve items to review every quarter to keep AI spend under control.",                                                       minutes: 6,  icon: ListChecks  },
  { kind: "REPORT",     tone: "var(--sg-signal)",  title: "How to Measure AI ROI Without Guesswork",                    excerpt: "Concrete formulas: cost per PR, cost per resolved ticket, cost per active developer. With templates.",                     minutes: 15, icon: Calculator  },
];

export default function ResourcesPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 08"
        label="OPERATING LIBRARY"
        title={
          <>
            The AI spend &<br />
            <span className="italic font-light">governance</span> reading list.
          </>
        }
        lead="Practical guides, calculators, and comparisons for the people responsible for AI cost, adoption, and policy."
        kicker={"LIBRARY\n6 FORMATS\n" + new Date().getFullYear()}
      />

      {/* Format strip */}
      <section className="py-8 border-y sg-line bg-[var(--sg-panel)]">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {FORMATS.map(f => (
            <div key={f.label} className="flex items-center gap-3 p-3 hover:bg-[var(--sg-bg)] transition-colors">
              <f.icon className="h-4 w-4 text-[var(--sg-signal)]" />
              <div className="min-w-0">
                <p className="sg-caption text-[var(--sg-text)]">{f.label}</p>
                <p className="text-[10px] text-[var(--sg-text-mute)] leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="FEATURED ARTIFACTS" tone="lens" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)]">
            What to <span className="italic font-light">read first.</span>
          </h2>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--sg-line)] border sg-line">
            {/* TODO: Articles are previews-only until the MDX/blog collection ships.
                 Wire each to /resources/[slug] when content is ready. */}
            {ARTICLES.map((a, i) => (
              <article
                key={a.title}
                aria-label={`${a.title} — preview, not yet published`}
                className="bg-[var(--sg-bg)] p-6 h-full relative"
              >
                <span aria-hidden className="absolute -top-px -left-px h-1.5 w-12" style={{ background: a.tone }} />
                <div className="flex items-center justify-between mb-4">
                  <span className="sg-caption" style={{ color: a.tone }}>{a.kind}</span>
                  <span className="sg-caption text-[var(--sg-budget)] text-[9px] inline-flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> COMING SOON
                  </span>
                </div>
                <a.icon className="h-5 w-5 text-[var(--sg-text)] mb-3" />
                <h3 className="sg-title text-lg text-[var(--sg-text)] leading-snug">{a.title}</h3>
                <p className="mt-3 text-sm text-[var(--sg-text-soft)] leading-relaxed">{a.excerpt}</p>
                <p className="mt-5 sg-caption text-[var(--sg-text-mute)] text-[10px]">
                  PREVIEW · № {String(i + 1).padStart(3, "0")} · {a.minutes} MIN
                </p>
              </article>
            ))}
          </div>

          {/* Library status note — honest about preview state */}
          <div className="mt-10 border border-dashed sg-line p-5 bg-[var(--sg-panel)] flex items-start gap-3 max-w-3xl">
            <Clock className="h-5 w-5 text-[var(--sg-budget)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="sg-caption text-[var(--sg-budget)]">LIBRARY IN CURATION</p>
              <p className="mt-1 text-sm text-[var(--sg-text-soft)] leading-relaxed">
                These are previews of pieces in our writing queue — not live articles yet. Reach out via the contact form below and we&apos;ll send each one as it ships.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CreativeCTA
        title="Get the AI spend digest in your inbox."
        subtitle="One email per month. The most useful piece we published. Unsubscribe anytime."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Book Demo", href: "/demo" }}
      />
    </>
  );
}
