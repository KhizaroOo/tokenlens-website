"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { Cpu, DollarSign, Zap, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";

// ── Types ──────────────────────────────────────────────────────────────────────
type ModelRow = {
  model: string;
  provider: string;
  providerLabel: string;
  _sum: { totalCostUsd: number; totalTokens: number; inputTokens: number; outputTokens: number };
};

type FlatDailyRow = { model: string; date: string; totalTokens: number; totalCostUsd: number };
type PivotedDailyRow = { date: string; [model: string]: number | string };

type ApiResponse = { models: ModelRow[]; daily: FlatDailyRow[]; error?: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtUsd(n: number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

/** "2025-05-11" → "May 11" */
function fmtDateLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Pivot flat [{model, date, totalTokens}] rows into
 * [{date: "May 11", "claude-sonnet-4": 1234, "claude-opus-4": 5678}]
 * for Recharts LineChart
 */
function pivotDaily(rows: FlatDailyRow[]): PivotedDailyRow[] {
  const map = new Map<string, PivotedDailyRow>();
  for (const row of rows) {
    const label = fmtDateLabel(row.date);
    if (!map.has(label)) map.set(label, { date: label });
    map.get(label)![row.model] = row.totalTokens;
  }
  return Array.from(map.values());
}

const PIE_COLORS = [CHART_COLORS.emerald, CHART_COLORS.cyan, CHART_COLORS.indigo, CHART_COLORS.amber];
const LINE_COLORS = [CHART_COLORS.emerald, CHART_COLORS.cyan, CHART_COLORS.indigo, CHART_COLORS.amber];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ModelsPage() {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const models = data?.models ?? [];
  const flatDaily = data?.daily ?? [];

  // Totals — Number() guards against any stray Decimal strings
  const totalCost   = models.reduce((s, m) => s + Number(m._sum.totalCostUsd ?? 0), 0);
  const totalTokens = models.reduce((s, m) => s + Number(m._sum.totalTokens  ?? 0), 0);

  // Pivot for line chart
  const pivotedDaily = pivotDaily(flatDaily);
  const modelNames   = models.map((m) => m.model);

  // Pie data
  const pieData = models.slice(0, 4).map((m, i) => ({
    name:  m.model,
    value: Number(m._sum.totalCostUsd ?? 0),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <PageShell title="AI Models" subtitle="Usage and cost by Claude model">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Models Used"  value={String(models.length)}   icon={Cpu}        iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
            <StatCard label="Total Tokens" value={fmtTokens(totalTokens)}  icon={Zap}        iconColor="text-indigo-500"  iconBg="bg-indigo-500/10"  />
            <StatCard label="Total Cost"   value={fmtUsd(totalCost)}        icon={DollarSign} iconColor="text-amber-500"   iconBg="bg-amber-500/10"   />
            <StatCard label="Period"       value="30 days"                  icon={TrendingUp} iconColor="text-cyan-500"    iconBg="bg-cyan-500/10"    />
          </>
        )}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Token Usage by Model — line chart with pivoted data */}
        <div className="lg:col-span-2">
          <SectionCard title="Token Usage by Model" subtitle="Last 30 days">
            {loading ? (
              <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
            ) : pivotedDaily.length === 0 ? (
              <EmptyState icon={Cpu} title="No trend data yet" description="Sync usage data to see model trends." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={pivotedDaily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtTokens(Number(v))}
                  />
                  <Tooltip
                    {...CHART_TOOLTIP}
                    formatter={(v, name) => [fmtTokens(Number(v)), String(name ?? "").replace("claude-", "")]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px" }}
                    formatter={(value) => value.replace("claude-", "")}
                  />
                  {modelNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>

        {/* Cost Share — pie chart */}
        <SectionCard title="Cost Share">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : pieData.length === 0 ? (
            <EmptyState icon={Cpu} title="No data yet" description="Sync to populate cost share." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    {...CHART_TOOLTIP}
                    formatter={(v: unknown) => [`$${Number(v).toFixed(4)}`, "Cost"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground font-data">{d.name.replace("claude-", "")}</span>
                    </div>
                    <span className="font-bold text-foreground font-data">{fmtUsd(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* ── Model details table ── */}
      <SectionCard title="Model Details" noPadding>
        {error ? (
          <EmptyState icon={Cpu} title="Failed to load models" description={error} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Model", "Provider", "Input Tokens", "Output Tokens", "Total Tokens", "Cost"].map((h) => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                  : models.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                        No models found. Sync usage data first.
                      </td>
                    </tr>
                  )
                  : models.map((model) => (
                    <tr
                      key={model.provider + "|" + model.model}
                      className={TR + " cursor-pointer"}
                      onClick={() => router.push("/ai-models/" + encodeURIComponent(model.model))}
                    >
                      <td className={TD + " font-data text-xs font-semibold"}>
                        <span className="text-emerald-500 hover:text-emerald-400 transition-colors">
                          {model.model}
                        </span>
                      </td>
                      <td className={TD}>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{model.providerLabel}</span>
                      </td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(model._sum.inputTokens)}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(model._sum.outputTokens)}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(model._sum.totalTokens)}</td>
                      <td className={TD_MONO + " font-bold text-foreground"}>{fmtUsd(model._sum.totalCostUsd)}</td>
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
