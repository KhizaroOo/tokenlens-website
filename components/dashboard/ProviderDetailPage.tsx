"use client";

/**
 * Shared component for individual API Spend provider pages
 * (Claude, OpenAI, Gemini, Perplexity)
 */
import { useEffect, useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { DollarSign, Zap, Users, Cpu } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";

function fmtUsd(n: number) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Totals { totalCostUsd: number; totalTokens: number; inputTokens: number; outputTokens: number; cachedTokens: number }
interface UserRow { userEmail: string; totalCostUsd: number; totalTokens: number; inputTokens: number; outputTokens: number }
interface TrendRow { date: string; totalCostUsd: number; totalTokens: number }
interface ModelRow { model: string; totalCostUsd: number; totalTokens: number; inputTokens: number; outputTokens: number }

interface Props {
  providerSlug: string;  // "claude" | "openai" | "gemini" | "perplexity"
  label: string;
  subtitle: string;
  accentColor?: string;
}

export function ProviderDetailPage({ providerSlug, label, subtitle, accentColor = "text-emerald-500" }: Props) {
  const [totals, setTotals]   = useState<Totals | null>(null);
  const [byUser, setByUser]   = useState<UserRow[]>([]);
  const [trend, setTrend]     = useState<TrendRow[]>([]);
  const [byModel, setByModel] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/llm-spend/${providerSlug}?days=30`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setTotals(d.totals);
        setByUser(d.byUser ?? []);
        setTrend((d.trend ?? []).map((r: TrendRow) => ({ ...r, date: fmtDate(r.date) })));
        setByModel(d.byModel ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [providerSlug]);

  const barData = byModel.slice(0, 6).map(m => ({ name: m.model.replace(/^(claude|gpt|gemini|sonar)-?/, ""), cost: m.totalCostUsd }));

  return (
    <PageShell title={label} subtitle={subtitle}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard label="Total Cost (30d)"    value={fmtUsd(totals?.totalCostUsd ?? 0)}       icon={DollarSign} iconColor="text-amber-500"   iconBg="bg-amber-500/10" />
            <StatCard label="Total Tokens"        value={fmtTokens(totals?.totalTokens ?? 0)}     icon={Zap}        iconColor="text-indigo-500"  iconBg="bg-indigo-500/10" />
            <StatCard label="Input Tokens"        value={fmtTokens(totals?.inputTokens ?? 0)}     icon={Zap}        iconColor="text-cyan-500"    iconBg="bg-cyan-500/10" />
            <StatCard label="Active Users"        value={String(byUser.length)}                   icon={Users}      iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
          </>
        )}
      </div>

      <SectionCard title="Daily Cost Trend" subtitle="Last 30 days">
        {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : trend.length === 0 ? (
          <EmptyState icon={DollarSign} title="No data" description="No usage found for this period." />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + Number(v).toFixed(2)} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v: unknown) => [fmtUsd(Number(v)), "Cost"]} />
              <Line type="monotone" dataKey="totalCostUsd" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={false} name="Cost" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {byModel.length > 0 && (
        <SectionCard title="Cost by Model">
          {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + Number(v).toFixed(2)} />
                <Tooltip {...CHART_TOOLTIP} formatter={(v: unknown) => [fmtUsd(Number(v)), "Cost"]} />
                <Bar dataKey="cost" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      )}

      {/* Token breakdown */}
      {totals && (
        <SectionCard title="Token Breakdown">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Input Tokens</p><p className={`text-2xl font-bold font-data ${accentColor}`}>{fmtTokens(totals.inputTokens)}</p></div>
            <div><p className="text-xs text-muted-foreground">Output Tokens</p><p className="text-2xl font-bold font-data text-cyan-500">{fmtTokens(totals.outputTokens)}</p></div>
            <div><p className="text-xs text-muted-foreground">Cached Tokens</p><p className="text-2xl font-bold font-data text-slate-400">{fmtTokens(totals.cachedTokens)}</p></div>
            <div><p className="text-xs text-muted-foreground">Total Cost</p><p className="text-2xl font-bold font-data text-amber-500">{fmtUsd(totals.totalCostUsd)}</p></div>
          </div>
        </SectionCard>
      )}

      {/* Models table */}
      {byModel.length > 0 && (
        <SectionCard title="Models" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">{["Model", "Input", "Output", "Total Tokens", "Cost"].map(h => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {byModel.map((m, i) => (
                  <tr key={i} className={TR}>
                    <td className={TD + " font-data text-xs font-semibold text-emerald-500"}>{m.model}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(m.inputTokens)}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(m.outputTokens)}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(m.totalTokens)}</td>
                    <td className={TD_MONO + " font-bold"}>{fmtUsd(m.totalCostUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Users table */}
      <SectionCard title="User Breakdown" noPadding>
        {error ? <EmptyState icon={Users} title="Failed to load" description={error} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">{["User", "Input Tokens", "Output Tokens", "Total Tokens", "Cost"].map(h => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                  : byUser.length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">No data found.</td></tr>
                  : byUser.map((u, i) => (
                    <tr key={i} className={TR}>
                      <td className={TD + " font-data text-xs"}>{u.userEmail}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(u.inputTokens)}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(u.outputTokens)}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(u.totalTokens)}</td>
                      <td className={TD_MONO + " font-bold"}>{fmtUsd(u.totalCostUsd)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
