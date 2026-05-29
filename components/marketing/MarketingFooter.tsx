import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LensGlyph } from "./gallery";

const COLUMNS = [
  {
    label: "Product",
    links: [
      { label: "Platform",      href: "/platform" },
      { label: "Integrations",  href: "/integrations" },
      { label: "Pricing",       href: "/pricing" },
      { label: "Security",      href: "/security" },
      { label: "Demo",          href: "/demo" },
    ],
  },
  {
    label: "Solutions",
    links: [
      { label: "For CTOs",             href: "/solutions#cto" },
      { label: "For CFOs",             href: "/solutions#cfo" },
      { label: "For FinOps",           href: "/solutions#finops" },
      { label: "For Engineering",      href: "/solutions#engineering" },
      { label: "Use Cases",            href: "/use-cases" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Library",              href: "/resources" },
      { label: "About",                href: "/about" },
      { label: "Contact",              href: "/contact" },
      { label: "Book Demo",            href: "/demo" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy",              href: "/privacy" },
      { label: "Terms",                href: "/terms" },
      { label: "Security",             href: "/security" },
    ],
  },
];

const PROVIDER_DOTS = [
  { name: "Claude",        color: "var(--sg-signal)" },
  { name: "OpenAI",        color: "var(--sg-lens)" },
  { name: "Copilot",       color: "var(--sg-anomaly)" },
  { name: "Cursor",        color: "var(--sg-budget)" },
  { name: "M365 Copilot",  color: "#6366F1" },
  { name: "Gemini",        color: "var(--sg-budget)" },
  { name: "Perplexity",    color: "var(--sg-budget)" },
];

export function MarketingFooter() {
  return (
    <footer className="relative mt-20 border-t-2 border-[var(--sg-ink)]">
      <div className="mx-auto max-w-7xl px-5 lg:px-10 py-16 lg:py-24">

        {/* End-wall wordmark */}
        <div className="relative">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <h2 className="sg-display text-[18vw] lg:text-[14rem] xl:text-[18rem] leading-[0.8] tracking-tighter text-[var(--sg-text)] -mb-4">
              TokenLens
            </h2>
            <div className="ml-auto sg-caption text-[var(--sg-text-mute)] mb-4">
              END OF EXHIBIT
              <br />
              <span className="text-[var(--sg-text-soft)]">scroll up to revisit</span>
            </div>
          </div>
          {/* Signal line beneath wordmark */}
          <div className="mt-6 h-px bg-[var(--sg-line)]" />
        </div>

        {/* Provider dots strip */}
        <div className="mt-8 flex items-center gap-5 flex-wrap">
          <span className="sg-caption text-[var(--sg-text-mute)]">PROVIDERS COVERED ·</span>
          {PROVIDER_DOTS.map(p => (
            <span key={p.name} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
              <span className="sg-caption text-[var(--sg-text-soft)]">{p.name}</span>
            </span>
          ))}
        </div>

        {/* CTA panel */}
        <div className="mt-14 lg:mt-20 grid lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-7 border-2 border-[var(--sg-ink)] p-8 lg:p-12 relative">
            <span aria-hidden className="absolute -top-px -left-px h-2 w-12 bg-[var(--sg-signal)]" />
            <p className="sg-caption text-[var(--sg-text-mute)]">INSTALLATION 09 — FINAL CTA</p>
            <h3 className="mt-3 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-lg">
              The operating lens for company-wide AI.
            </h3>
            <p className="mt-4 text-[var(--sg-text-soft)] max-w-md leading-relaxed">
              See AI spend, adoption, and governance across every provider — before the invoice arrives.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/demo"
                className="group inline-flex items-center gap-2 px-5 py-3 bg-[var(--sg-ink)] text-[var(--sg-bg)] font-semibold text-sm hover:bg-[var(--sg-signal)] hover:text-[#050505] transition-colors"
              >
                Book Demo
                <ArrowUpRight className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 px-5 py-3 border sg-line text-[var(--sg-text)] font-semibold text-sm hover:border-[var(--sg-ink)]/40 transition-colors"
              >
                Explore Platform
              </Link>
            </div>
          </div>

          {/* Logo + description column */}
          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="flex items-center gap-2.5 mb-3">
              <LensGlyph size={28} />
              <span className="sg-display text-xl text-[var(--sg-text)]">TokenLens</span>
            </div>
            <p className="text-sm text-[var(--sg-text-soft)] max-w-sm leading-relaxed">
              The operating lens for company-wide AI usage. Cost, adoption, productivity, and governance — across every provider — in one editorial dashboard.
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {COLUMNS.map(col => (
            <div key={col.label}>
              <p className="sg-caption text-[var(--sg-text-mute)] mb-4">{col.label}</p>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[var(--sg-text-soft)] hover:text-[var(--sg-text)] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-16 pt-6 border-t sg-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="sg-caption text-[var(--sg-text-mute)]">
            © {new Date().getFullYear()} TOKENLENS · ALL RIGHTS RESERVED · GALLERY EDITION
          </p>
          <div className="flex items-center gap-5 sg-caption">
            <Link href="/privacy"  className="text-[var(--sg-text-mute)] hover:text-[var(--sg-text)]">PRIVACY</Link>
            <Link href="/terms"    className="text-[var(--sg-text-mute)] hover:text-[var(--sg-text)]">TERMS</Link>
            <Link href="/security" className="text-[var(--sg-text-mute)] hover:text-[var(--sg-text)]">SECURITY</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
