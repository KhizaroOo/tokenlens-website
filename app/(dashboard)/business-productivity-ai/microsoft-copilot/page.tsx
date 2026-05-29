"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { Building2, Users, DollarSign, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";

function fmtUsd(n: number) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const APP_LABELS: Record<string, string> = { teams: "Teams", word: "Word", excel: "Excel", outlook: "Outlook", powerpoint: "PowerPoint" };
const APP_COLORS = [CHART_COLORS.cyan, CHART_COLORS.emerald, CHART_COLORS.indigo, CHART_COLORS.amber, "#a78bfa"];

type AppRow   = { app: string; activeUsers: number; totalSessions: number; totalCostUsd: number };
type TrendRow = { date: string; activeUsers: number; totalSessions: number; totalCostUsd: number };
type Totals   = { activeUsers: number; totalSessions: number; totalCostUsd: number; totalSeats: number; activeSeats: number; costPerSeat: number };

export default function MicrosoftCopilotPage() {
  const [totals, setTotals]   = useState<Totals | null>(null);
  const [byApp, setByApp]     = useState<AppRow[]>([]);
  const [trend, setTrend]     = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/business-productivity-ai?days=30")
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setTotals(d.totals);
        setByApp(d.byApp ?? []);
        setTrend((d.trend ?? []).map((r: TrendRow) => ({ ...r, date: fmtDate(r.date) })));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const barData = byApp.map((r, i) => ({ name: APP_LABELS[r.app] ?? r.app, sessions: r.totalSessions, users: r.activeUsers, color: APP_COLORS[i % APP_COLORS.length] }));

  return (
    <PageShell title="Microsoft Copilot" subtitle="Microsoft 365 Copilot — Teams, Word, Excel, Outlook, PowerPoint usage">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard label="Total Sessions"  value={(totals?.totalSessions ?? 0).toLocaleString()} icon={Activity}   iconColor="text-cyan-500"    iconBg="bg-cyan-500/10" />
            <StatCard label="Active Users"    value={(totals?.activeUsers   ?? 0).toLocaleString()} icon={Users}      iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
            <StatCard label="Seats"           value={`${totals?.activeSeats ?? 0} / ${totals?.totalSeats ?? 0}`} icon={Building2} iconColor="text-indigo-500" iconBg="bg-indigo-500/10" />
            <StatCard label="Total Cost"      value={fmtUsd(totals?.totalCostUsd ?? 0)}             icon={DollarSign} iconColor="text-amber-500"   iconBg="bg-amber-500/10" />
          </>
        )}
      </div>

      {totals && (
        <SectionCard title="Seat Utilization">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Total Seats</p><p className="text-2xl font-bold font-data">{totals.totalSeats}</p></div>
            <div><p className="text-xs text-muted-foreground">Active Seats</p><p className="text-2xl font-bold font-data text-cyan-500">{totals.activeSeats}</p></div>
            <div><p className="text-xs text-muted-foreground">Utilization</p><p className="text-2xl font-bold font-data text-emerald-500">{totals.totalSeats ? ((totals.activeSeats / totals.totalSeats) * 100).toFixed(0) + "%" : "0%"}</p></div>
            <div><p className="text-xs text-muted-foreground">Cost / Seat / Mo</p><p className="text-2xl font-bold font-data text-amber-500">${totals.costPerSeat}</p></div>
          </div>
          <div className="mt-4">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${totals.totalSeats ? (totals.activeSeats / totals.totalSeats) * 100 : 0}%` }} />
            </div>
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Sessions by App">
          {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="sessions" fill={CHART_COLORS.cyan} radius={[4,4,0,0]} name="Sessions" />
                <Bar dataKey="users"    fill={CHART_COLORS.emerald} radius={[4,4,0,0]} name="Users" />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
        <SectionCard title="Daily Trend">
          {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : trend.length === 0 ? (
            <EmptyState icon={Activity} title="No trend data" description="" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Line type="monotone" dataKey="activeUsers"   stroke={CHART_COLORS.cyan}    strokeWidth={2} dot={false} name="Active Users" />
                <Line type="monotone" dataKey="totalSessions" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={false} name="Sessions" />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <SectionCard title="App Breakdown" noPadding>
        {error ? <EmptyState icon={Building2} title="Failed to load" description={error} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">{["Application", "Active Users", "Sessions", "Cost (30d)"].map(h => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                  : byApp.length === 0 ? <tr><td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">No data.</td></tr>
                  : byApp.map((row, i) => (
                    <tr key={row.app} className={TR}>
                      <td className={TD + " font-semibold"}>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: APP_COLORS[i % APP_COLORS.length] }} />
                          {APP_LABELS[row.app] ?? row.app}
                        </div>
                      </td>
                      <td className={TD_MONO}>{row.activeUsers}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{row.totalSessions}</td>
                      <td className={TD_MONO + " font-bold"}>{fmtUsd(row.totalCostUsd)}</td>
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
