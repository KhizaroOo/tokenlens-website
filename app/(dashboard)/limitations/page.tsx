"use client";

import { useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { CheckCircle, XCircle, AlertTriangle, Info, HelpCircle } from "lucide-react";
import { PROVIDERS, CATEGORY_LABELS, CATEGORY_BADGE, type ProviderKey } from "@/modules/providers/registry";

// ── Per-provider limitation data ──────────────────────────────────────────────

interface DataPoint {
  label: string;
  available: boolean;
  note?: string;
}

interface ProviderLimitation {
  key: ProviderKey;
  authRequired: string;
  available: DataPoint[];
  unavailable: DataPoint[];
  specialRequirements: string[];
  computedFields: string[];
}

const LIMITATIONS: ProviderLimitation[] = [
  {
    key: "anthropic",
    authRequired: "Admin API Key (sk-ant-admin-…) — provisioned in Claude Console",
    available: [
      { label: "Token breakdown per user per day", available: true },
      { label: "Cost per user (USD)", available: true },
      { label: "Model usage breakdown", available: true },
      { label: "Org-level aggregate cost", available: true },
      { label: "Workspace members list", available: true },
      { label: "API keys list", available: true },
    ],
    unavailable: [
      { label: "Real-time usage (sub-hour)", available: false, note: "Up to 1-hour delay; daily aggregation only" },
      { label: "Billing invoices / payment info", available: false, note: "Console only" },
      { label: "AWS Bedrock / Azure / Vertex AI usage", available: false, note: "Anthropic Admin API covers Anthropic-hosted only" },
    ],
    specialRequirements: [
      "Requires an Organization account (not personal)",
      "Admin API key is separate from standard API keys",
    ],
    computedFields: [],
  },
  {
    key: "openai",
    authRequired: "Admin API Key — provisioned at platform.openai.com/settings/organization/admin-keys",
    available: [
      { label: "Token usage per model / user / project (daily)", available: true },
      { label: "Cost per project (daily buckets)", available: true },
      { label: "Per-user token and cost breakdown", available: true },
      { label: "API keys list", available: true },
    ],
    unavailable: [
      { label: "Sub-minute usage granularity", available: false, note: "Minimum bucket width is 1 day" },
      { label: "Billing invoices / payment details", available: false, note: "Console only" },
    ],
    specialRequirements: [
      "Users must set their Default Organization in OpenAI settings, otherwise their usage won't appear in org-level reports",
      "Admin API key is a separate credential type from project keys",
    ],
    computedFields: [],
  },
  {
    key: "gemini",
    authRequired: "Google Cloud project + Billing Export to BigQuery (API key alone is insufficient for aggregate data)",
    available: [
      { label: "Per-call token counts (in API response)", available: true, note: "Available in usageMetadata field of every response" },
    ],
    unavailable: [
      { label: "Aggregate historical cost via REST API", available: false, note: "No /billing or /usage endpoint on generativelanguage.googleapis.com" },
      { label: "Historical token usage query", available: false, note: "No queryable usage history endpoint via API key" },
      { label: "Cost data via simple API key", available: false, note: "Requires Google Cloud Billing Export to BigQuery" },
    ],
    specialRequirements: [
      "Must set up Google Cloud Billing Export to BigQuery (not available with AI Studio API key alone)",
      "Requires a GCP project with billing enabled",
      "BigQuery dataset must be provisioned and export configured in Cloud Billing Console",
      "Integration status: Coming in Phase 2B (BigQuery connector)",
    ],
    computedFields: [
      "All cost figures are estimated by TokenLens using published Gemini pricing rates applied to self-logged token counts",
    ],
  },
  {
    key: "perplexity",
    authRequired: "API Key — but no programmatic billing/usage API exists",
    available: [
      { label: "Per-call token counts (in API response)", available: true, note: "prompt_tokens + completion_tokens in usage field" },
      { label: "Enterprise webhook audit logs (real-time)", available: true, note: "Enterprise plan only (50+ seats)" },
    ],
    unavailable: [
      { label: "Aggregate cost / usage REST API", available: false, note: "No such endpoint exists. Dashboard only." },
      { label: "Historical usage query", available: false, note: "No API. Per-call responses only." },
      { label: "API Group spend breakdown", available: false, note: "Groups exist in console but spend is not queryable via API" },
    ],
    specialRequirements: [
      "Perplexity has no admin usage/billing REST API at any plan tier",
      "Enterprise webhook audit logs require 50+ seat Enterprise plan",
      "Integration status: Coming in Phase 2B (requires Enterprise webhook setup per customer)",
    ],
    computedFields: [
      "All cost figures are estimated by TokenLens using published Perplexity pricing applied to self-logged token counts",
    ],
  },
  {
    key: "claude_code",
    authRequired: "Uses Anthropic Admin API connection — no separate credential",
    available: [
      { label: "Sessions per user per day", available: true },
      { label: "Commits made by Claude Code", available: true },
      { label: "Pull requests opened by Claude Code", available: true },
      { label: "Lines added / removed by Claude Code", available: true },
      { label: "Tool acceptance / rejection rates", available: true },
      { label: "Token usage and cost per user", available: true },
    ],
    unavailable: [
      { label: "All developer git activity (manual commits, PR reviews, CI)", available: false, note: "Anthropic API only reports Claude Code-initiated actions" },
      { label: "AWS Bedrock / Azure / Vertex AI Claude Code", available: false, note: "Only Anthropic-hosted API covered" },
      { label: "Sub-daily granularity", available: false, note: "Daily aggregation, up to 1-hour delay" },
    ],
    specialRequirements: [
      "Anthropic Admin API key must be connected first",
      "Metrics only cover actions Claude Code itself performed — not the developer's full Git history",
    ],
    computedFields: [],
  },
  {
    key: "github_copilot",
    authRequired: "Personal Access Token (PAT) with manage_billing:copilot scope + Organization name",
    available: [
      { label: "Total / active / inactive seat counts", available: true },
      { label: "Per-user last activity date and editor", available: true },
      { label: "Suggestion and completion metrics (28-day rolling)", available: true },
      { label: "Acceptance rate per user", available: true },
    ],
    unavailable: [
      { label: "Dollar spend from GitHub API", available: false, note: "Cost is computed: seats × plan rate" },
      { label: "Model-level breakdown (which model generated suggestions)", available: false, note: "Not surfaced in metrics API" },
      { label: "Data before October 10, 2025", available: false, note: "GitHub Copilot analytics history starts Oct 10, 2025" },
    ],
    specialRequirements: [
      "Requires Copilot Business or Copilot Enterprise subscription",
      "Note: Old /copilot/metrics endpoints were retired April 2, 2026 — we use the new /copilot/metrics/reports/* endpoints",
    ],
    computedFields: [
      "Cost = active seats × $19/month (Business) or $39/month (Enterprise)",
    ],
  },
  {
    key: "cursor",
    authRequired: "Admin API Key from Cursor team settings",
    available: [
      { label: "Daily usage per user: lines added/deleted", available: true },
      { label: "AI suggestions shown and accepted", available: true },
      { label: "Tab completions, Composer / Chat / Agent requests", available: true },
      { label: "Per-user premium request spending (cents)", available: true },
      { label: "Member list with emails", available: true },
      { label: "Seat count from member list", available: true },
    ],
    unavailable: [
      { label: "Base subscription cost", available: false, note: "Flat rate not in API; computed from seat count" },
      { label: "Granular per-call usage events", available: false, note: "Enterprise-only endpoint" },
      { label: "History beyond 30-day window", available: false, note: "API max range is 30 days per request" },
      { label: "Billing group spend", available: false, note: "Enterprise-only" },
    ],
    specialRequirements: [
      "Richest endpoints (granular events, billing groups, spend limits) require Enterprise plan",
      "Teams plan has analytics + reporting but not all endpoints",
    ],
    computedFields: [
      "Base subscription cost = seat count × $40/month (Business) — premium spend is from API",
    ],
  },
  {
    key: "microsoft_copilot",
    authRequired: "Microsoft Entra App Registration — Tenant ID + Client ID + Client Secret, with Reports.Read.All permission (admin consent required)",
    available: [
      { label: "Active users per app (Teams, Word, Excel, Outlook, PowerPoint, OneNote, Loop)", available: true },
      { label: "Per-user last activity date per app", available: true },
      { label: "Licensed seat count (from subscribedSkus)", available: true },
    ],
    unavailable: [
      { label: "Dollar spend from Microsoft API", available: false, note: "Not exposed. Cost is computed: seats × $30/month" },
      { label: "Prompt counts per user per app", available: false, note: "Graph API returns last-activity dates only, not prompt counts" },
      { label: "Daily granularity per user", available: false, note: "Only rolling D7 / D30 / D90 / D180 windows available" },
      { label: "Unlicensed Copilot Chat usage", available: false, note: "API only covers licensed M365 Copilot users" },
      { label: "US Government L4/L5 (DoD) or China 21Vianet tenants", available: false, note: "Global service only" },
    ],
    specialRequirements: [
      "Microsoft 365 Copilot license required per tracked user",
      "Entra App Registration requires tenant admin consent for Reports.Read.All",
      "The user-detail endpoint is Microsoft Graph beta — subject to change",
    ],
    computedFields: [
      "Cost = licensed seats × $30/month (Microsoft 365 Copilot list price)",
    ],
  },
];

// ── Coverage badge tooltip config ─────────────────────────────────────────────

const COVERAGE_INFO: Record<string, { label: string; color: string; meaning: string; canGet: string; cannotGet: string }> = {
  full: {
    label: "Full",
    color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    meaning: "Complete API coverage — all data is retrieved directly from the provider's official admin API.",
    canGet: "Token usage, cost per user, model breakdown, org aggregates, user list",
    cannotGet: "Real-time sub-hour data, billing invoices (console only)",
  },
  partial: {
    label: "Partial",
    color: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    meaning: "The provider API exists and works, but has gaps — not all data points are available programmatically.",
    canGet: "Org-level costs, model usage, projects, seat counts",
    cannotGet: "Per-user token detail (OpenAI) / granular per-developer metrics (Cursor) without CSV export",
  },
  estimated: {
    label: "Estimated",
    color: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    meaning: "No admin API exists. Cost figures are estimated by TokenLens using published pricing rates × self-logged token counts from API responses.",
    canGet: "Per-call token counts (in each API response)",
    cannotGet: "Aggregate historical cost, historical usage query, org-wide spend — no admin endpoint exists",
  },
  seat_based: {
    label: "Seat Based",
    color: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
    meaning: "This provider charges a flat licence per seat — there are no token counts or per-request costs to track. Data covers seat utilisation and activity only.",
    canGet: "Seat count (total / active / inactive), last activity date, suggestion acceptance rates, editor used",
    cannotGet: "Token usage, per-request cost, model-level breakdown — flat pricing model has none of these",
  },
  requires_enterprise: {
    label: "Requires Enterprise",
    color: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    meaning: "The Microsoft Graph API endpoints for Copilot usage are locked behind Microsoft 365 Enterprise licences (E3/E5 + Copilot add-on). Personal or Business Basic plans return no Copilot data.",
    canGet: "Active users per app (Teams, Word, Excel, Outlook…), licensed seat count, last activity per user",
    cannotGet: "Dollar spend (computed only), prompt counts per user, daily granularity, unlicensed Copilot Chat usage",
  },
};

// ── Tooltip component ──────────────────────────────────────────────────────────

function CoverageTooltip({ type }: { type: string }) {
  const [open, setOpen] = useState(false);
  const info = COVERAGE_INFO[type];
  if (!info) return null;

  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-1 text-white/30 hover:text-white/60 transition-colors"
        aria-label={`What does ${info.label} mean?`}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span className="absolute left-6 top-0 z-50 w-72 rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl p-3.5 text-left pointer-events-none">
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${info.color}`}>
            {info.label}
          </span>
          <p className="text-xs text-white/70 leading-relaxed mb-2">{info.meaning}</p>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">What we can show</p>
              <p className="text-[11px] text-white/50 leading-relaxed">{info.canGet}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider mb-0.5">What we cannot show</p>
              <p className="text-[11px] text-white/50 leading-relaxed">{info.cannotGet}</p>
            </div>
          </div>
        </span>
      )}
    </span>
  );
}

// ── Summary table ──────────────────────────────────────────────────────────────

const SUMMARY_ROWS = [
  { badge: "full",                label: "Full",               color: "bg-emerald-500/15 text-emerald-400", providers: "Claude / Anthropic, Claude Code",  meaning: "Complete data via admin API",                                  canGet: "Tokens, cost, users, models, org aggregates",                          cannotGet: "Real-time (<1 hr), billing invoices" },
  { badge: "partial",             label: "Partial",            color: "bg-amber-500/15 text-amber-400",     providers: "OpenAI, Cursor",                   meaning: "API exists but has data gaps",                                 canGet: "Org costs, models, projects, seat counts",                             cannotGet: "Per-user token detail (OpenAI), granular dev metrics (Cursor)" },
  { badge: "seat_based",          label: "Seat Based",         color: "bg-cyan-500/15 text-cyan-400",       providers: "GitHub Copilot",                   meaning: "Flat licence model — no token costs",                          canGet: "Seat count, active/inactive users, acceptance rate, editor used",      cannotGet: "Token usage, per-request cost, model breakdown" },
  { badge: "estimated",           label: "Estimated",          color: "bg-amber-500/15 text-amber-400",     providers: "Gemini, Perplexity",               meaning: "No admin API — costs estimated from pricing × token counts",   canGet: "Per-call token counts only (in each API response)",                    cannotGet: "Aggregate history, org-wide spend — no admin endpoint exists" },
  { badge: "requires_enterprise", label: "Requires Enterprise",color: "bg-indigo-500/15 text-indigo-400",  providers: "Microsoft Copilot",                meaning: "API gated behind M365 E3/E5 + Copilot licence",                canGet: "Active users per app, licensed seats, last activity",                  cannotGet: "Dollar spend (computed), prompt counts, daily granularity" },
];

function SummaryTable() {
  return (
    <SectionCard
      title="Data Coverage — What Each Badge Means"
      subtitle="Hover the ? icon on any badge for inline details"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Badge", "Applies To", "Meaning", "What TokenLens CAN Show", "What TokenLens CANNOT Show"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-white/35 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUMMARY_ROWS.map((row, i) => (
              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${row.color}`}>
                    {row.label}
                    <CoverageTooltip type={row.badge} />
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-white/60 whitespace-nowrap">{row.providers}</td>
                <td className="px-3 py-3 text-xs text-white/70">{row.meaning}</td>
                <td className="px-3 py-3">
                  <span className="text-xs text-emerald-400/80">{row.canGet}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs text-red-400/60">{row.cannotGet}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ── Components ─────────────────────────────────────────────────────────────────

function DataPointRow({ point }: { point: DataPoint }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      {point.available
        ? <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        : <XCircle    className="h-4 w-4 text-red-400/70  flex-shrink-0 mt-0.5" />}
      <div>
        <span className={`text-sm ${point.available ? "text-foreground" : "text-muted-foreground"}`}>
          {point.label}
        </span>
        {point.note && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">{point.note}</p>
        )}
      </div>
    </div>
  );
}

export default function LimitationsPage() {
  return (
    <PageShell
      title="Provider Limitations"
      subtitle="Honest documentation of what each provider API can and cannot provide"
    >
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Built on official provider APIs only</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            TokenLens only shows data that is programmatically accessible via each provider&apos;s official API.
            Where data must be estimated (e.g. cost from token counts × pricing), it is clearly labelled.
            No web scraping, no unofficial endpoints.
          </p>
        </div>
      </div>

      {/* Demo data notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Non-Anthropic providers currently show demo data</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            <strong className="text-foreground">Claude / Claude Code</strong> show live data via the Anthropic Admin API.
            All other providers (OpenAI, GitHub Copilot, Cursor, Microsoft Copilot, Gemini, Perplexity)
            display representative demo data until you connect your real API credentials in Settings.
            Once connected and synced, live data replaces the demo figures automatically.
          </p>
        </div>
      </div>

      {/* Coverage summary table */}
      <SummaryTable />

      {/* Per-provider cards */}
      {LIMITATIONS.map(lim => {
        const prov = PROVIDERS.find(p => p.key === lim.key);
        if (!prov) return null;

        return (
          <SectionCard
            key={lim.key}
            title={prov.displayName}
            subtitle={
              <span className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CATEGORY_BADGE[prov.category]}`}>
                  {CATEGORY_LABELS[prov.category]}
                </span>
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${COVERAGE_INFO[prov.dataCoverage]?.color ?? "bg-white/5 text-white/40"}`}>
                  {COVERAGE_INFO[prov.dataCoverage]?.label ?? prov.dataCoverage}
                  <CoverageTooltip type={prov.dataCoverage} />
                </span>
              </span>
            }
          >
            <div className="space-y-5">
              {/* Auth */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Required Credential
                </p>
                <p className="text-sm text-foreground">{lim.authRequired}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available */}
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Available via API
                  </p>
                  <div className="divide-y divide-border/50">
                    {lim.available.map((p, i) => <DataPointRow key={i} point={p} />)}
                  </div>
                </div>

                {/* Not available */}
                <div>
                  <p className="text-xs font-bold text-red-400/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> Not available via API
                  </p>
                  <div className="divide-y divide-border/50">
                    {lim.unavailable.map((p, i) => <DataPointRow key={i} point={p} />)}
                  </div>
                </div>
              </div>

              {/* Special requirements */}
              {lim.specialRequirements.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Requirements &amp; Constraints
                  </p>
                  <ul className="space-y-1">
                    {lim.specialRequirements.map((r, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-400/60 mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Computed fields */}
              {lim.computedFields.length > 0 && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> Estimated / Computed Fields
                  </p>
                  <ul className="space-y-1">
                    {lim.computedFields.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-400/60 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionCard>
        );
      })}
    </PageShell>
  );
}
