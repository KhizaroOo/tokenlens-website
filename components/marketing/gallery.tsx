/**
 * Signal Gallery — design system primitives.
 *
 * Visual identity: editorial museum / observatory.
 * - Warm off-white in light, museum-black in dark
 * - Signal palette: emerald (signal), cyan (lens), violet (anomaly), amber (budget), red (risk)
 * - Mono-uppercase eyebrows ("EXHIBIT 01 / TITLE")
 * - Big editorial display type
 * - Asymmetric layouts, irregular shapes, fine SVG lines
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ExhibitLabel — eyebrow tag, "EXHIBIT 01 / TITLE"
// ─────────────────────────────────────────────────────────────────────────────

export function ExhibitLabel({
  index, label, tone = "signal",
}: {
  index?: string;
  label: string;
  tone?: "signal" | "lens" | "anomaly" | "budget" | "risk" | "ink";
}) {
  const dotColor = {
    signal:  "bg-[var(--sg-signal)]",
    lens:    "bg-[var(--sg-lens)]",
    anomaly: "bg-[var(--sg-anomaly)]",
    budget:  "bg-[var(--sg-budget)]",
    risk:    "bg-[var(--sg-risk)]",
    ink:     "bg-[var(--sg-ink)]",
  }[tone];
  return (
    <span className="inline-flex items-center gap-2 sg-eyebrow text-[var(--sg-text-soft)]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {index && <span className="text-[var(--sg-text)]">{index}</span>}
      {index && <span className="text-[var(--sg-text-mute)]">/</span>}
      <span>{label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LensGlyph — small custom logo mark
// ─────────────────────────────────────────────────────────────────────────────

export function LensGlyph({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="lens-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="var(--sg-signal-glow)" />
          <stop offset="100%" stopColor="var(--sg-lens-glow)" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="14" cy="14" r="12" fill="none" stroke="url(#lens-gradient)" strokeWidth="1.4" opacity="0.9" />
      {/* Inner aperture */}
      <circle cx="14" cy="14" r="5" fill="url(#lens-gradient)" />
      {/* Aperture blade hint */}
      <circle cx="14" cy="14" r="5" fill="var(--sg-bg)" opacity="0.85" />
      <circle cx="14" cy="14" r="2" fill="url(#lens-gradient)" />
      {/* Tick marks */}
      <g stroke="url(#lens-gradient)" strokeWidth="1.2" strokeLinecap="round">
        <line x1="14" y1="0.5" x2="14" y2="3" />
        <line x1="14" y1="25" x2="14" y2="27.5" />
        <line x1="0.5" y1="14" x2="3" y2="14" />
        <line x1="25" y1="14" x2="27.5" y2="14" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GallerySection — top-level section wrapper with optional numbered margin
// ─────────────────────────────────────────────────────────────────────────────

export function GallerySection({
  children, className = "", id, number, total = 8,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  number?: string;     // e.g. "02"
  total?: number;
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        {number && (
          <div className="absolute left-3 lg:left-6 top-12 hidden lg:flex flex-col items-center gap-2">
            <span className="sg-number text-[10px] tracking-widest text-[var(--sg-text-mute)] -rotate-90 origin-center mt-12">
              {number} / {String(total).padStart(2, "0")}
            </span>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MuseumCaption — three-line caption used on hero visuals and panels
// ─────────────────────────────────────────────────────────────────────────────

export function MuseumCaption({
  title, subtitle, meta, align = "left",
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`max-w-xs ${align === "right" ? "text-right ml-auto" : "text-left"}`}>
      <p className="sg-caption text-[var(--sg-text-mute)]">{meta}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--sg-text)] leading-snug">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-[var(--sg-text-soft)] leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SignalLine — fine horizontal divider with a label
// ─────────────────────────────────────────────────────────────────────────────

export function SignalLine({
  label, side = "left",
}: {
  label?: string;
  side?: "left" | "center" | "right";
}) {
  return (
    <div className="flex items-center gap-3 my-12 lg:my-16">
      {side !== "left" && <div className="flex-1 h-px bg-[var(--sg-line)]" />}
      {label && <span className="sg-caption text-[var(--sg-text-mute)] whitespace-nowrap">— {label} —</span>}
      {side !== "right" && <div className="flex-1 h-px bg-[var(--sg-line)]" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KineticMetricCard — instrument-readout style stat
// ─────────────────────────────────────────────────────────────────────────────

export function KineticMetricCard({
  label, value, sublabel, tone = "signal", trend,
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "signal" | "lens" | "anomaly" | "budget" | "risk";
  trend?: string;
}) {
  const accent = {
    signal:  "var(--sg-signal)",
    lens:    "var(--sg-lens)",
    anomaly: "var(--sg-anomaly)",
    budget:  "var(--sg-budget)",
    risk:    "var(--sg-risk)",
  }[tone];
  return (
    <div className="relative border sg-line bg-[var(--sg-panel)] p-4 lg:p-5 group hover:border-[var(--sg-ink)]/30 transition-colors">
      {/* corner tick mark */}
      <span aria-hidden className="absolute -top-px -left-px h-2 w-2 border-t border-l" style={{ borderColor: accent }} />
      <span aria-hidden className="absolute -top-px -right-px h-2 w-2 border-t border-r" style={{ borderColor: accent }} />
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
        <span className="sg-caption text-[var(--sg-text-mute)]">{label}</span>
      </div>
      <p className="sg-number text-2xl lg:text-3xl font-bold tracking-tight text-[var(--sg-text)] leading-none">{value}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        {sublabel && <p className="text-[11px] text-[var(--sg-text-soft)] leading-tight">{sublabel}</p>}
        {trend && <p className="sg-number text-[11px]" style={{ color: accent }}>{trend}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AsymmetricFeaturePanel — alternating image+text feature with editorial layout
// ─────────────────────────────────────────────────────────────────────────────

export function AsymmetricFeaturePanel({
  index, eyebrow, title, body, visual, flip = false, tone = "signal",
}: {
  index: string;        // "EXHIBIT 02"
  eyebrow: string;      // "PROVIDER COST MAP"
  title: string;
  body: string;
  visual: ReactNode;
  flip?: boolean;
  tone?: "signal" | "lens" | "anomaly" | "budget" | "risk";
}) {
  return (
    <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-center py-12 lg:py-20">
      <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="sg-number text-5xl lg:text-6xl font-black tracking-tighter text-[var(--sg-text)] leading-none">
            {index}
          </span>
          <ExhibitLabel label={eyebrow} tone={tone} />
        </div>
        <h3 className="sg-title text-3xl lg:text-4xl text-[var(--sg-text)] mt-4 max-w-lg">{title}</h3>
        <p className="mt-5 text-base text-[var(--sg-text-soft)] leading-relaxed max-w-md">{body}</p>
      </div>
      <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
        {visual}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DataRibbon — horizontal scrolling-strip of data items (no actual scroll, static visual)
// ─────────────────────────────────────────────────────────────────────────────

export function DataRibbon({ items }: { items: { label: string; value: string; tone?: "signal" | "lens" | "anomaly" | "budget" | "risk" }[] }) {
  return (
    <div className="relative border-y sg-line py-5 overflow-hidden bg-[var(--sg-panel)]">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--sg-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--sg-bg)] to-transparent z-10 pointer-events-none" />
      <div className="flex items-center gap-10 lg:gap-14 px-6 whitespace-nowrap">
        {items.map((it, i) => {
          const c = {
            signal: "var(--sg-signal)", lens: "var(--sg-lens)", anomaly: "var(--sg-anomaly)",
            budget: "var(--sg-budget)", risk: "var(--sg-risk)",
          }[it.tone ?? "signal"];
          return (
            <div key={i} className="flex items-center gap-3 flex-shrink-0">
              <span className="h-1 w-1 rounded-full" style={{ background: c }} />
              <span className="sg-caption text-[var(--sg-text-mute)]">{it.label}</span>
              <span className="sg-number font-bold text-[var(--sg-text)]">{it.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CreativeCTA — final-section CTA, museum-installation feel
// ─────────────────────────────────────────────────────────────────────────────

export function CreativeCTA({
  eyebrow = "INSTALLATION 09",
  title = "Bring your AI stack into focus.",
  subtitle = "Twenty minutes. One operating lens. Your entire AI footprint, in one view.",
  primary = { label: "Book Demo", href: "/demo" },
  secondary = { label: "Explore Platform", href: "/platform" },
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative my-24 lg:my-40">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="relative border-y-2 border-[var(--sg-ink)] py-16 lg:py-28 overflow-hidden">
          {/* big lens aura */}
          <div className="absolute -inset-x-20 -top-20 -bottom-20 sg-lens-aura -z-10" />
          {/* radial corner ticks */}
          <span aria-hidden className="absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-[var(--sg-signal)]" />
          <span aria-hidden className="absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-[var(--sg-signal)]" />
          <span aria-hidden className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-[var(--sg-signal)]" />
          <span aria-hidden className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-[var(--sg-signal)]" />

          <div className="text-center max-w-4xl mx-auto">
            <ExhibitLabel label={eyebrow} tone="signal" />
            <h2 className="sg-display text-4xl sm:text-5xl lg:text-7xl text-[var(--sg-text)] mt-6">
              {title}
            </h2>
            <p className="mt-6 text-base lg:text-lg text-[var(--sg-text-soft)] max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={primary.href}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-[var(--sg-ink)] text-[var(--sg-bg)] font-semibold text-sm rounded-none hover:bg-[var(--sg-signal)] hover:text-[#050505] transition-colors"
              >
                {primary.label}
                <ArrowUpRight className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link
                href={secondary.href}
                className="inline-flex items-center gap-2 px-6 py-3 border sg-line text-[var(--sg-text)] font-semibold text-sm hover:border-[var(--sg-ink)]/40 transition-colors"
              >
                {secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditorialPageHero — used by inner pages (not homepage)
// ─────────────────────────────────────────────────────────────────────────────

export function EditorialPageHero({
  exhibit, label, title, lead, kicker,
}: {
  exhibit: string;     // "EXHIBIT 02"
  label: string;       // "PLATFORM ATLAS"
  title: ReactNode;
  lead?: string;
  kicker?: string;
}) {
  return (
    <section className="relative pt-20 lg:pt-28 pb-12 lg:pb-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-9">
            <div className="flex items-baseline gap-4">
              <span className="sg-number text-5xl lg:text-7xl font-black tracking-tighter text-[var(--sg-text)] leading-none">{exhibit}</span>
              <ExhibitLabel label={label} tone="signal" />
            </div>
            <h1 className="sg-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-[var(--sg-text)] mt-8 max-w-5xl">
              {title}
            </h1>
            {lead && (
              <p className="mt-8 text-lg lg:text-xl text-[var(--sg-text-soft)] max-w-2xl leading-relaxed">{lead}</p>
            )}
          </div>
          {kicker && (
            <div className="lg:col-span-3 lg:text-right">
              <p className="sg-caption text-[var(--sg-text-mute)] whitespace-pre-line">{kicker}</p>
            </div>
          )}
        </div>
        <div className="mt-12 h-px bg-[var(--sg-line)]" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PlinthCard — for pricing / gallery objects on a stand
// ─────────────────────────────────────────────────────────────────────────────

export function PlinthCard({
  name, blurb, features, featured, cta, secondaryCta, tag,
}: {
  name: string;
  blurb: string;
  features: string[];
  featured?: boolean;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tag?: string;
}) {
  return (
    <div className={`relative flex flex-col h-full ${featured ? "lg:-mt-6" : ""}`}>
      {/* Top plinth tag */}
      <div className="flex items-center justify-between mb-3">
        <span className="sg-caption text-[var(--sg-text-mute)]">{tag ?? "PLAN"}</span>
        {featured && (
          <span className="sg-caption px-2 py-0.5 bg-[var(--sg-ink)] text-[var(--sg-bg)]">
            CURRENT EXHIBIT
          </span>
        )}
      </div>

      <div className={`flex-1 border bg-[var(--sg-panel)] p-7 lg:p-9 ${featured ? "border-[var(--sg-ink)] shadow-[0_0_0_1px_var(--sg-ink)]" : "sg-line"}`}>
        <h3 className="sg-display text-4xl lg:text-5xl text-[var(--sg-text)]">{name}</h3>
        <p className="mt-3 text-sm text-[var(--sg-text-soft)] leading-relaxed">{blurb}</p>

        <div className="mt-7 mb-5 pb-5 border-b sg-line">
          <p className="sg-caption text-[var(--sg-text-mute)]">Custom pricing</p>
          <p className="mt-1 sg-number text-lg text-[var(--sg-text)]">scales with providers + seats</p>
        </div>

        <ul className="space-y-2.5">
          {features.map(f => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--sg-text-soft)]">
              <span aria-hidden className="mt-2 h-px w-3 bg-[var(--sg-signal)] flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href={cta.href}
            className={`group inline-flex items-center justify-between gap-2 px-5 py-3 font-semibold text-sm transition-colors ${
              featured
                ? "bg-[var(--sg-ink)] text-[var(--sg-bg)] hover:bg-[var(--sg-signal)] hover:text-[#050505]"
                : "border sg-line text-[var(--sg-text)] hover:border-[var(--sg-ink)]/40"
            }`}
          >
            <span>{cta.label}</span>
            <ArrowUpRight className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="text-xs sg-caption text-[var(--sg-text-mute)] hover:text-[var(--sg-text)] transition-colors text-center mt-2"
            >
              {secondaryCta.label} →
            </Link>
          )}
        </div>
      </div>
      {/* Plinth base */}
      <div aria-hidden className="h-2 mt-1 bg-[var(--sg-line)]" />
      <div aria-hidden className="h-1 mt-px bg-[var(--sg-line-soft)]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IntegrationArtifactCard — provider tile, museum-artifact style
// ─────────────────────────────────────────────────────────────────────────────

export function IntegrationArtifactCard({
  providerKey, name, category, status, examples, index,
}: {
  providerKey: string;
  name: string;
  category: string;
  status: "available" | "in-progress" | "planned" | "limited";
  examples?: string[];
  index?: number;
}) {
  const dotTone: Record<string, string> = {
    anthropic:         "var(--sg-signal)",
    claude_code:       "var(--sg-signal)",
    openai:            "var(--sg-lens)",
    github_copilot:    "var(--sg-anomaly)",
    cursor:            "var(--sg-budget)",
    microsoft_copilot: "#6366F1",
    gemini:            "var(--sg-budget)",
    perplexity:        "var(--sg-budget)",
  };
  const statusStyle = {
    "available":   { color: "var(--sg-signal)", label: "AVAILABLE" },
    "in-progress": { color: "var(--sg-lens)",   label: "IN PROGRESS" },
    "planned":     { color: "var(--sg-text-mute)", label: "PLANNED" },
    "limited":     { color: "var(--sg-budget)", label: "LIMITED" },
  }[status];
  const dot = dotTone[providerKey] ?? "var(--sg-signal)";
  return (
    <article className="group relative border sg-line p-6 hover:border-[var(--sg-ink)]/30 transition-colors bg-[var(--sg-panel)]">
      {/* Index gallery number */}
      {index !== undefined && (
        <span aria-hidden className="absolute top-3 right-4 sg-number text-[10px] text-[var(--sg-text-mute)]">
          № {String(index).padStart(3, "0")}
        </span>
      )}
      {/* Big artifact circle */}
      <div className="relative h-14 w-14 mb-5">
        <div aria-hidden className="absolute inset-0 rounded-full" style={{ background: dot, opacity: 0.15 }} />
        <div aria-hidden className="absolute inset-2 rounded-full border" style={{ borderColor: dot }} />
        <span aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full" style={{ background: dot }} />
      </div>
      <p className="sg-caption text-[var(--sg-text-mute)]">{category}</p>
      <h3 className="mt-1 text-lg font-bold text-[var(--sg-text)]">{name}</h3>

      <div className="mt-4 flex items-center gap-1.5">
        <span className="h-1 w-1 rounded-full" style={{ background: statusStyle.color }} />
        <span className="sg-caption" style={{ color: statusStyle.color }}>{statusStyle.label}</span>
      </div>

      {examples && examples.length > 0 && (
        <ul className="mt-4 pt-4 border-t sg-line-soft space-y-1.5">
          {examples.map(e => (
            <li key={e} className="text-xs text-[var(--sg-text-soft)] flex items-start gap-1.5">
              <span aria-hidden className="mt-1.5 h-px w-2 bg-[var(--sg-text-mute)] flex-shrink-0" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SecurityTrustPanel — security pillar tile
// ─────────────────────────────────────────────────────────────────────────────

import type { LucideIcon } from "lucide-react";

export function SecurityTrustPanel({
  icon: Icon, title, body, tone = "signal",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  tone?: "signal" | "lens" | "anomaly" | "budget" | "ink";
}) {
  const accent = {
    signal:  "var(--sg-signal)",
    lens:    "var(--sg-lens)",
    anomaly: "var(--sg-anomaly)",
    budget:  "var(--sg-budget)",
    ink:     "var(--sg-ink)",
  }[tone];
  return (
    <div className="border sg-line p-7 bg-[var(--sg-panel)] hover:border-[var(--sg-ink)]/30 transition-colors group">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-5 w-5" style={{ color: accent }} />
        <span className="sg-caption text-[var(--sg-text-mute)] group-hover:text-[var(--sg-text)] transition-colors">SECURE</span>
      </div>
      <h3 className="sg-title text-xl text-[var(--sg-text)]">{title}</h3>
      <p className="mt-3 text-sm text-[var(--sg-text-soft)] leading-relaxed">{body}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PersonaLensCard — for solutions page
// ─────────────────────────────────────────────────────────────────────────────

export function PersonaLensCard({
  role, lens, headline, needs, icon: Icon, anchor,
}: {
  role: string;
  lens: string;      // "Adoption + Provider Lens"
  headline: string;
  needs: string[];
  icon: LucideIcon;
  anchor?: string;
}) {
  return (
    <article id={anchor} className="border sg-line bg-[var(--sg-panel)] p-7 lg:p-9 relative">
      {/* Top label row */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--sg-signal)]" />
          <span className="sg-caption text-[var(--sg-text-mute)]">VIEW THROUGH LENS</span>
        </div>
        <span className="sg-caption text-[var(--sg-text-mute)]">{lens}</span>
      </div>

      <p className="sg-eyebrow text-[var(--sg-signal)]">{role}</p>
      <h3 className="sg-title text-2xl lg:text-3xl text-[var(--sg-text)] mt-3 max-w-md leading-tight">{headline}</h3>

      <ul className="mt-6 space-y-2.5">
        {needs.map(n => (
          <li key={n} className="flex items-start gap-3 text-sm text-[var(--sg-text-soft)] leading-relaxed">
            <span aria-hidden className="mt-2 h-px w-4 bg-[var(--sg-signal)] flex-shrink-0" />
            <span>{n}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SignalTile — for use-cases page
// ─────────────────────────────────────────────────────────────────────────────

export function SignalTile({
  signalType, icon: Icon, title, problem, solution, outcome, index,
}: {
  signalType: "COST" | "ADOPTION" | "GOVERNANCE" | "PRODUCTIVITY" | "RISK";
  icon: LucideIcon;
  title: string;
  problem: string;
  solution: string;
  outcome: string;
  index: number;
}) {
  const signalColor = {
    COST: "var(--sg-budget)",
    ADOPTION: "var(--sg-signal)",
    GOVERNANCE: "var(--sg-anomaly)",
    PRODUCTIVITY: "var(--sg-lens)",
    RISK: "var(--sg-risk)",
  }[signalType];
  return (
    <article className="group relative border sg-line p-6 bg-[var(--sg-panel)] hover:border-[var(--sg-ink)]/30 transition-colors">
      <span aria-hidden className="absolute -top-px -left-px h-2 w-12" style={{ background: signalColor }} />
      <div className="flex items-center justify-between mb-5">
        <span className="sg-number text-xs text-[var(--sg-text-mute)]">№ {String(index).padStart(3, "0")}</span>
        <span className="sg-caption" style={{ color: signalColor }}>{signalType} SIGNAL</span>
      </div>
      <Icon className="h-6 w-6 text-[var(--sg-text)] mb-4" />
      <h3 className="text-lg font-bold text-[var(--sg-text)] leading-tight">{title}</h3>
      <div className="mt-5 space-y-3">
        <Row label="PROBLEM"  text={problem}  tone="risk"   />
        <Row label="SOLUTION" text={solution} tone="lens"   />
        <Row label="OUTCOME"  text={outcome}  tone="signal" />
      </div>
    </article>
  );
}

function Row({ label, text, tone }: { label: string; text: string; tone: "risk" | "lens" | "signal" }) {
  const c = { risk: "var(--sg-risk)", lens: "var(--sg-lens)", signal: "var(--sg-signal)" }[tone];
  return (
    <div>
      <p className="sg-caption" style={{ color: c }}>{label}</p>
      <p className="mt-0.5 text-xs text-[var(--sg-text-soft)] leading-relaxed">{text}</p>
    </div>
  );
}
