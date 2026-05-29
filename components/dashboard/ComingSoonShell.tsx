"use client";

import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { CheckCircle2 } from "lucide-react";

interface SampleInsight {
  label: string;
  value: string;
  hint?: string;
  accent?: "emerald" | "cyan" | "amber" | "indigo" | "red";
}

interface ComingSoonShellProps {
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle: string;
  /** Hero icon (Lucide) */
  icon: LucideIcon;
  /** Color theme for hero icon */
  iconAccent?: "emerald" | "cyan" | "amber" | "indigo";
  /** One-sentence explanation of what the feature does */
  tagline: string;
  /** 3–5 business-value bullets (CTO/CFO/EM language) */
  valueBullets: string[];
  /** Sample insight tiles to preview what the page will look like */
  sampleInsights?: SampleInsight[];
  /** Who benefits and why */
  audience?: { role: string; benefit: string }[];
}

const ICON_BG: Record<string, string> = {
  emerald: "bg-emerald-500/10",
  cyan:    "bg-cyan-500/10",
  amber:   "bg-amber-500/10",
  indigo:  "bg-indigo-500/10",
};
const ICON_COLOR: Record<string, string> = {
  emerald: "text-emerald-400",
  cyan:    "text-cyan-400",
  amber:   "text-amber-400",
  indigo:  "text-indigo-400",
};
const ACCENT_BG: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cyan:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  amber:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  indigo:  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  red:     "bg-red-500/10 text-red-400 border-red-500/20",
};

export function ComingSoonShell({
  title,
  subtitle,
  icon: Icon,
  iconAccent = "emerald",
  tagline,
  valueBullets,
  sampleInsights,
  audience,
}: ComingSoonShellProps) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      {/* Hero / explanation */}
      <SectionCard
        title={title}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-amber-500/15 text-amber-400">
              Coming Soon
            </span>
            <span className="text-muted-foreground">{subtitle}</span>
          </span>
        }
      >
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${ICON_BG[iconAccent]} flex-shrink-0`}>
            <Icon className={`h-7 w-7 ${ICON_COLOR[iconAccent]}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-sm text-foreground leading-relaxed">{tagline}</p>
            <ul className="space-y-2">
              {valueBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Sample insight tiles */}
      {sampleInsights && sampleInsights.length > 0 && (
        <SectionCard
          title="Example Insights"
          subtitle="Sample metrics this page will surface once enabled"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sampleInsights.map((s, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${ACCENT_BG[s.accent ?? "emerald"]}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{s.label}</p>
                <p className="mt-1.5 text-xl font-bold font-data text-foreground">{s.value}</p>
                {s.hint && (
                  <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{s.hint}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Audience / who benefits */}
      {audience && audience.length > 0 && (
        <SectionCard title="Who This Helps" subtitle="Built for the people accountable for AI ROI">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {audience.map((a, i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">{a.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.benefit}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}
