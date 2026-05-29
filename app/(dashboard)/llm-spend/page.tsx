"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import Link from "next/link";
import { DollarSign, Zap, Users, TrendingUp, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";

// ── Types ─────────────────────────────────────────────────────────────────────
type ProviderTotals = Record<string, { totalCostUsd: number; totalTokens: number; inputTokens: number; outputTokens: number }>;
type TrendRow = { date: string; anthropic?: number; openai?: number; [k: string]: number | string | undefined };
type UserRow = { provider: string; userEmail: string; totalCostUsd: number; totalTokens: number };
type ModelRow = { provider: string; model: string; totalCostUsd: number; totalTokens: number; inputTokens: number; outputTokens: number };
type ApiResponse = { providerTotals: ProviderTotals; trend: TrendRow[]; topUsers: UserRow[]; models: ModelRow[]; error?: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtUsd(n: number) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PROVIDERS = ["anthropic", "openai"];
const PROVIDER_LABELS: Record<string, string> = { anthropic: "Claude", openai: "OpenAI" };
const LINE_COLORS = [CHART_COLORS.emerald, CHART_COLORS.cyan, CHART_COLORS.indigo, CHART_COLORS.amber];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ApiSpendPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/llm-spend?days=30")
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = data?.providerTotals ?? {};
  const grandCost   = Object.values(totals).reduce((s, r) => s + r.totalCostUsd, 0);
  const grandTokens = Object.values(totals).reduce((s, r) => s + r.totalTokens,  0);

  const trend = (data?.trend ?? []).map((r) => ({ ...r, date: fmtDate(String(r.date)) }));
  const topUsers = data?.topUsers ?? [];
  const models = data?.models ?? [];

  // Bar chart data: provider totals
  const barData = PROVIDERS.map((p) => ({
    provider: PROVIDER_LABELS[p] ?? p,
    cost: totals[p]?.totalCostUsd ?? 0,
  }));

  return (
    <PageShell title="LLM/API Spend Providers" subtitle="Token usage and cost across integrated API providers — Claude, OpenAI">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard label="Total Cost (30d)"   value={fmtUsd(grandCost)}        icon={DollarSign} iconColor="text-amber-500"   iconBg="bg-amber-500/10" />
            <StatCard label="Total Tokens (30d)" value={fmtTokens(grandTokens)}   icon={Zap}        iconColor="text-indigo-500"  iconBg="bg-indigo-500/10" />
            <StatCard label="Active Providers"   value={String(PROVIDERS.length)} icon={TrendingUp} iconColor="text-cyan-500"    iconBg="bg-cyan-500/10" />
            <StatCard label="Top Users"          value={String(new Set(topUsers.map(u => u.userEmail)).size)} icon={Users} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
          </>
        )}
      </div>

      {/* ── Provider Comparison Bar ── */}
      <SectionCard title="Cost by Provider" subtitle="Last 30 days">
        {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="provider" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + Number(v).toFixed(2)} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v: unknown) => [fmtUsd(Number(v)), "Cost"]} />
              <Bar dataKey="cost" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* ── Cost Trend Line Chart — full width ── */}
      <SectionCard title="Daily Cost Trend" subtitle="Last 30 days">
        {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : trend.length === 0 ? (
          <EmptyState icon={DollarSign} title="No trend data" description="Sync providers to see cost trends." />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + Number(v).toFixed(1)} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v: unknown, name: unknown) => [fmtUsd(Number(v)), PROVIDER_LABELS[String(name ?? "")] ?? String(name ?? "")]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(val) => PROVIDER_LABELS[val] ?? val} />
              {PROVIDERS.map((p, i) => (
                <Line key={p} type="monotone" dataKey={p} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* ── Provider Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PROVIDERS.map((p, i) => {
          const t = totals[p];
          const color = LINE_COLORS[i % LINE_COLORS.length];
          return (
            <div key={p} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{PROVIDER_LABELS[p]}</p>
              <p className="text-xl font-bold font-data" style={{ color }}>{fmtUsd(t?.totalCostUsd ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">{fmtTokens(t?.totalTokens ?? 0)} tokens</p>
            </div>
          );
        })}
        {/* Limited providers — no admin API */}
        {[{ key: "gemini", label: "Gemini" }, { key: "perplexity", label: "Perplexity" }].map(lp => (
          <Link key={lp.key} href="/limitations" className="group rounded-lg border border-white/5 bg-white/[0.02] p-4 opacity-60 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{lp.label}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/15 text-amber-400 tracking-wide uppercase">Limited</span>
            </div>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">No admin API — data unavailable</p>
          </Link>
        ))}
      </div>

      {/* ── Top Users Table ── */}
      <SectionCard title="Top Users by Cost" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["User", "Provider", "Tokens", "Cost"].map((h) => <th key={h} className={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                : topUsers.length === 0
                ? <tr><td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">No data found.</td></tr>
                : topUsers.slice(0, 15).map((u, i) => (
                  <tr key={i} className={TR}>
                    <td className={TD + " font-data text-xs"}>{u.userEmail}</td>
                    <td className={TD}><span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{PROVIDER_LABELS[u.provider] ?? u.provider}</span></td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(u.totalTokens)}</td>
                    <td className={TD_MONO + " font-bold text-foreground"}>{fmtUsd(u.totalCostUsd)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Models Table ── */}
      {models.length > 0 && (
        <SectionCard title="Model Breakdown" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Model", "Provider", "Input Tokens", "Output Tokens", "Total Tokens", "Cost"].map((h) => <th key={h} className={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr key={i} className={TR}>
                    <td className={TD + " font-data text-xs font-semibold text-emerald-500"}>{m.model}</td>
                    <td className={TD}><span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{PROVIDER_LABELS[m.provider] ?? m.provider}</span></td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(m.inputTokens)}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(m.outputTokens)}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(m.totalTokens)}</td>
                    <td className={TD_MONO + " font-bold text-foreground"}>{fmtUsd(m.totalCostUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}
