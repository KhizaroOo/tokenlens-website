"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BackButton } from "@/components/dashboard/BackButton";
import { StatCardSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Cpu, DollarSign, Zap, TrendingUp } from "lucide-react";
import { format } from "date-fns";

type ModelDetail = {
  profile: {
    model: string; provider: string;
    totalCost: number; totalTokens: number; inputTokens: number;
    outputTokens: number; cachedTokens: number;
    costShare: number; tokenShare: number;
  };
  costAnalytics: {
    avgDailyCost: number;
    highestCostDay: { date: string; cost: number } | null;
    forecast30d: number;
  };
  dailyUsage: {
    date: string; cost: number; tokens: number;
    input: number; output: number; cached: number;
  }[];
};

function fmtUsd(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

export default function ModelDetailPage() {
  const params = useParams<{ modelName: string }>();
  const modelName = decodeURIComponent(params.modelName);
  const [data, setData] = useState<ModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const encoded = encodeURIComponent(modelName);
    fetch(`/api/models/${encoded}/details?days=30`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [modelName]);

  if (loading) {
    return (
      <PageShell title="Model Details" subtitle="Loading…">
        <BackButton href="/ai-models" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="Model Details" subtitle="">
        <BackButton href="/ai-models" />
        <EmptyState icon={Cpu} title="Model not found" description={error ?? "Could not load model details."} />
      </PageShell>
    );
  }

  const { profile: p, costAnalytics: ca, dailyUsage } = data;

  return (
    <PageShell title={p.model} subtitle={`${p.provider} · ${p.costShare.toFixed(1)}% of org cost`}>
      <BackButton href="/ai-models" />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Cost (30d)"     value={fmtUsd(p.totalCost)}          icon={DollarSign} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
        <StatCard label="Total Tokens (30d)"   value={fmtTokens(p.totalTokens)}     icon={Zap}        iconColor="text-cyan-500"    iconBg="bg-cyan-500/10"    />
        <StatCard label="30-Day Forecast"      value={fmtUsd(ca.forecast30d)}        icon={TrendingUp} iconColor="text-amber-500"   iconBg="bg-amber-500/10"   />
        <StatCard label="Avg Daily Cost"       value={fmtUsd(ca.avgDailyCost)}       icon={Cpu}        iconColor="text-indigo-500"  iconBg="bg-indigo-500/10"  />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Model overview */}
        <SectionCard title="Model Overview">
          <div className="space-y-2.5 text-sm">
            {[
              ["Model",          p.model,                           "text-emerald-500 font-data"],
              ["Provider",       p.provider,                        "text-foreground capitalize"],
              ["Total Cost",     fmtUsd(p.totalCost),               "text-emerald-500"],
              ["Cost Share",     p.costShare.toFixed(1) + "%",      "text-foreground"],
              ["Token Share",    p.tokenShare.toFixed(1) + "%",     "text-foreground"],
              ["Input Tokens",   fmtTokens(p.inputTokens),          "text-foreground"],
              ["Output Tokens",  fmtTokens(p.outputTokens),         "text-foreground"],
              ["Cached Tokens",  fmtTokens(p.cachedTokens),         "text-indigo-400"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Cost analytics */}
        <SectionCard title="Cost Analytics">
          <div className="space-y-2.5 text-sm">
            {[
              ["Avg Daily Cost",     fmtUsd(ca.avgDailyCost),       "text-foreground"],
              ["30-Day Forecast",    fmtUsd(ca.forecast30d),         "text-amber-500"],
              ["Highest Cost Day",   ca.highestCostDay ? `${format(new Date(ca.highestCostDay.date), "MMM d")} · ${fmtUsd(ca.highestCostDay.cost)}` : "—", "text-foreground"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Daily cost trend */}
      <SectionCard title="Daily Cost Trend">
        {dailyUsage.length === 0 ? <EmptyState icon={DollarSign} title="No data" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyUsage} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mg-cost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.emerald} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="cost" stroke={CHART_COLORS.emerald} fill="url(#mg-cost)" strokeWidth={2} dot={false} name="Cost ($)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Daily token breakdown */}
      <SectionCard title="Daily Token Breakdown">
        {dailyUsage.length === 0 ? <EmptyState icon={Zap} title="No token data" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyUsage} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="input"  fill={CHART_COLORS.emerald} radius={[3,3,0,0]} name="Input"  stackId="a" />
              <Bar dataKey="output" fill={CHART_COLORS.cyan}    radius={[3,3,0,0]} name="Output" stackId="a" />
              <Bar dataKey="cached" fill={CHART_COLORS.indigo}  radius={[3,3,0,0]} name="Cached" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Daily detail table */}
      <SectionCard title="Daily Usage Detail" noPadding>
        {dailyUsage.length === 0 ? <EmptyState icon={Cpu} title="No daily data" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Input", "Output", "Cached", "Total Tokens", "Cost"].map(h => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyUsage.map((d, i) => (
                  <tr key={i} className={TR}>
                    <td className={TD + " font-data text-muted-foreground"}>{d.date}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{d.input.toLocaleString()}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{d.output.toLocaleString()}</td>
                    <td className={TD_MONO + " text-indigo-400"}>{d.cached.toLocaleString()}</td>
                    <td className={TD_MONO + " text-foreground"}>{d.tokens.toLocaleString()}</td>
                    <td className={TD_MONO + " font-bold text-emerald-500"}>{fmtUsd(d.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
