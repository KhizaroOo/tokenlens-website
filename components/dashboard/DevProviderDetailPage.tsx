"use client";

/**
 * Shared component for Developer AI individual provider pages
 * (Claude Code, GitHub Copilot, Cursor)
 */
import { useEffect, useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { Code2, Users, GitCommit, GitPullRequest, TrendingUp, CheckSquare } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";

function fmtUsd(n: number) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function pct(num: number, den: number) { return den ? ((num / den) * 100).toFixed(1) + "%" : "0%"; }

interface Totals { sessions: number; commits: number; prs: number; linesAdded: number; linesRemoved: number; suggestions: number; acceptances: number; costUsd: number }
interface UserRow { userEmail: string; sessions: number; commits: number; prs: number; linesAdded: number; suggestions: number; acceptances: number; costUsd: number }
interface TrendRow { date: string; sessions: number; commits?: number; suggestions?: number; acceptances?: number }
interface SeatInfo { totalSeats: number; activeSeats: number; costPerSeat: number; totalCostUsd: number }

interface Props {
  providerSlug: string;
  label: string;
  subtitle: string;
  isCopilotStyle?: boolean; // GitHub Copilot or Cursor (suggestion-based)
  accentColor?: string;
}

export function DevProviderDetailPage({ providerSlug, label, subtitle, isCopilotStyle = false, accentColor = "text-emerald-500" }: Props) {
  const [totals, setTotals]   = useState<Totals | null>(null);
  const [byUser, setByUser]   = useState<UserRow[]>([]);
  const [trend, setTrend]     = useState<TrendRow[]>([]);
  const [seats, setSeats]     = useState<SeatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/developer-ai-tools/${providerSlug}?days=30`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setTotals(d.totals);
        setByUser(d.byUser ?? []);
        setTrend((d.trend ?? []).map((r: TrendRow) => ({ ...r, date: fmtDate(r.date) })));
        setSeats(d.seats ?? null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [providerSlug]);

  return (
    <PageShell title={label} subtitle={subtitle}>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          isCopilotStyle ? (
            <>
              <StatCard label="Suggestions (30d)"  value={(totals?.suggestions ?? 0).toLocaleString()}                   icon={Code2}        iconColor={accentColor}     iconBg="bg-emerald-500/10" />
              <StatCard label="Accepted"            value={(totals?.acceptances ?? 0).toLocaleString()}                   icon={CheckSquare}  iconColor="text-cyan-500"   iconBg="bg-cyan-500/10" />
              <StatCard label="Accept Rate"         value={pct(totals?.acceptances ?? 0, totals?.suggestions ?? 0)}      icon={TrendingUp}   iconColor="text-indigo-500" iconBg="bg-indigo-500/10" />
              <StatCard label="Active Seats"        value={String(seats?.activeSeats ?? byUser.length)}                  icon={Users}        iconColor="text-amber-500"  iconBg="bg-amber-500/10" />
            </>
          ) : (
            <>
              <StatCard label="Sessions (30d)"   value={(totals?.sessions ?? 0).toLocaleString()}     icon={Code2}         iconColor={accentColor}     iconBg="bg-emerald-500/10" />
              <StatCard label="Commits Assisted" value={(totals?.commits  ?? 0).toLocaleString()}     icon={GitCommit}     iconColor="text-cyan-500"   iconBg="bg-cyan-500/10" />
              <StatCard label="PRs Assisted"     value={(totals?.prs      ?? 0).toLocaleString()}     icon={GitPullRequest} iconColor="text-indigo-500" iconBg="bg-indigo-500/10" />
              <StatCard label="Total Cost (30d)" value={fmtUsd(totals?.costUsd ?? 0)}                icon={TrendingUp}    iconColor="text-amber-500"  iconBg="bg-amber-500/10" />
            </>
          )
        )}
      </div>

      {/* Seat info for copilot-style */}
      {seats && (
        <SectionCard title="Seat Utilization">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Total Seats</p><p className="text-2xl font-bold font-data">{seats.totalSeats}</p></div>
            <div><p className="text-xs text-muted-foreground">Active Seats</p><p className={`text-2xl font-bold font-data ${accentColor}`}>{seats.activeSeats}</p></div>
            <div><p className="text-xs text-muted-foreground">Cost / Seat / Mo</p><p className="text-2xl font-bold font-data text-amber-500">${seats.costPerSeat}</p></div>
            <div><p className="text-xs text-muted-foreground">Utilization</p><p className="text-2xl font-bold font-data text-cyan-500">{seats.totalSeats ? ((seats.activeSeats / seats.totalSeats) * 100).toFixed(0) + "%" : "0%"}</p></div>
          </div>
          <div className="mt-4">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${seats.totalSeats ? (seats.activeSeats / seats.totalSeats) * 100 : 0}%` }} />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Trend */}
      <SectionCard title="Daily Activity Trend" subtitle="Last 30 days">
        {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : trend.length === 0 ? (
          <EmptyState icon={Code2} title="No trend data" description="Sync to see activity trends." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              {isCopilotStyle ? (
                <>
                  <Line type="monotone" dataKey="suggestions" stroke={CHART_COLORS.cyan}    strokeWidth={2} dot={false} name="Suggestions" />
                  <Line type="monotone" dataKey="acceptances" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={false} name="Accepted" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="sessions" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={false} name="Sessions" />
                  <Line type="monotone" dataKey="commits"  stroke={CHART_COLORS.cyan}    strokeWidth={2} dot={false} name="Commits" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* User table */}
      <SectionCard title="Developer Breakdown" noPadding>
        {error ? <EmptyState icon={Users} title="Failed to load" description={error} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {isCopilotStyle
                    ? ["User", "Sessions", "Suggestions", "Accepted", "Accept Rate", "Cost"].map(h => <th key={h} className={TH}>{h}</th>)
                    : ["User", "Sessions", "Commits", "PRs", "Lines Added", "Cost"].map(h => <th key={h} className={TH}>{h}</th>)
                  }
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                  : byUser.length === 0 ? <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No data found.</td></tr>
                  : byUser.map((u, i) => (
                    <tr key={i} className={TR}>
                      <td className={TD + " font-data text-xs"}>{u.userEmail}</td>
                      <td className={TD_MONO}>{u.sessions}</td>
                      {isCopilotStyle ? (
                        <>
                          <td className={TD_MONO + " text-muted-foreground"}>{u.suggestions.toLocaleString()}</td>
                          <td className={TD_MONO + " text-muted-foreground"}>{u.acceptances.toLocaleString()}</td>
                          <td className={TD_MONO + " text-emerald-500"}>{pct(u.acceptances, u.suggestions)}</td>
                        </>
                      ) : (
                        <>
                          <td className={TD_MONO + " text-muted-foreground"}>{u.commits || "-"}</td>
                          <td className={TD_MONO + " text-muted-foreground"}>{u.prs || "-"}</td>
                          <td className={TD_MONO + " text-muted-foreground"}>{u.linesAdded ? u.linesAdded.toLocaleString() : "-"}</td>
                        </>
                      )}
                      <td className={TD_MONO + " font-bold"}>{fmtUsd(u.costUsd)}</td>
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
