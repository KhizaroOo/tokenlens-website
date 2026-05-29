"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { Code2, Users, Zap, TrendingUp, GitCommit, GitPullRequest, CheckSquare } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";

// ── Types ─────────────────────────────────────────────────────────────────────
type CcTotals = { sessions: number; commits: number; prs: number; linesAdded: number; linesRemoved: number; costUsd: number };
type DevTotals = { suggestions: number; acceptances: number; sessions: number; totalCostUsd: number };
type SeatInfo  = { activeSeats: number; totalSeats: number; totalCostUsd: number };
type UserRow   = { provider: string; userEmail: string; sessions: number; commits: number; prs: number; linesAdded: number; suggestions: number; acceptances: number; costUsd: number };
type TrendRow  = { date: string; claude_code?: number; github_copilot?: number; cursor?: number };
type ApiResponse = {
  claudeCode: CcTotals;
  github_copilot: DevTotals;
  cursor: DevTotals;
  seats: Record<string, SeatInfo>;
  trend: TrendRow[];
  users: UserRow[];
  error?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtUsd(n: number) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function pct(num: number, den: number) { return den ? ((num / den) * 100).toFixed(1) + "%" : "0%"; }

const PROVIDER_LABELS: Record<string, string> = { claude_code: "Claude Code", github_copilot: "GitHub Copilot", cursor: "Cursor" };
const LINE_COLORS = [CHART_COLORS.emerald, CHART_COLORS.cyan, CHART_COLORS.indigo];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DeveloperAiPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/developer-ai-tools?days=30")
      .then((r) => r.json())
      .then((d: ApiResponse) => { if (d.error) throw new Error(d.error); setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cc = data?.claudeCode;
  const gh = data?.github_copilot;
  const cu = data?.cursor;
  const seats = data?.seats ?? {};
  const trend = (data?.trend ?? []).map((r) => ({ ...r, date: fmtDate(r.date) }));
  const users = data?.users ?? [];

  const totalCost = (cc?.costUsd ?? 0) + (gh?.totalCostUsd ?? 0) + (cu?.totalCostUsd ?? 0)
    + (seats["github_copilot"]?.totalCostUsd ?? 0) + (seats["cursor"]?.totalCostUsd ?? 0);

  // Bar: acceptance rate by provider
  const acceptanceData = [
    { name: "GitHub Copilot", rate: gh ? parseFloat(pct(gh.acceptances, gh.suggestions)) : 0 },
    { name: "Cursor",         rate: cu ? parseFloat(pct(cu.acceptances, cu.suggestions)) : 0 },
  ];

  return (
    <PageShell title="Developer AI Tools" subtitle="Claude Code, GitHub Copilot, and Cursor — activity, suggestions, and productivity">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard label="Total Sessions (30d)" value={String(cc?.sessions ?? 0)}              icon={Code2}         iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
            <StatCard label="Commits Assisted"      value={String(cc?.commits ?? 0)}              icon={GitCommit}     iconColor="text-cyan-500"    iconBg="bg-cyan-500/10" />
            <StatCard label="PRs Assisted"          value={String(cc?.prs ?? 0)}                  icon={GitPullRequest} iconColor="text-indigo-500" iconBg="bg-indigo-500/10" />
            <StatCard label="Total Dev AI Cost"     value={fmtUsd(totalCost)}                     icon={TrendingUp}    iconColor="text-amber-500"   iconBg="bg-amber-500/10" />
          </>
        )}
      </div>

      {/* ── Provider Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Claude Code */}
        <SectionCard title="Claude Code">
          {loading ? <StatCardSkeleton /> : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Sessions</p><p className="text-xl font-bold font-data text-emerald-500">{cc?.sessions ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Commits</p><p className="text-xl font-bold font-data">{cc?.commits ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">PRs</p><p className="text-xl font-bold font-data">{cc?.prs ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Lines Added</p><p className="text-xl font-bold font-data">{(cc?.linesAdded ?? 0).toLocaleString()}</p></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">Est. Cost (30d)</p>
                <p className="text-lg font-bold font-data text-amber-500">{fmtUsd(cc?.costUsd ?? 0)}</p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* GitHub Copilot */}
        <SectionCard title="GitHub Copilot">
          {loading ? <StatCardSkeleton /> : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Suggestions</p><p className="text-xl font-bold font-data text-cyan-500">{(gh?.suggestions ?? 0).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Accepted</p><p className="text-xl font-bold font-data">{(gh?.acceptances ?? 0).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Accept Rate</p><p className="text-xl font-bold font-data text-emerald-500">{pct(gh?.acceptances ?? 0, gh?.suggestions ?? 0)}</p></div>
                <div><p className="text-xs text-muted-foreground">Active Seats</p><p className="text-xl font-bold font-data">{seats["github_copilot"]?.activeSeats ?? "-"}</p></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">Seat Cost (30d)</p>
                <p className="text-lg font-bold font-data text-amber-500">{fmtUsd(seats["github_copilot"]?.totalCostUsd ?? 0)}</p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Cursor */}
        <SectionCard title="Cursor">
          {loading ? <StatCardSkeleton /> : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Suggestions</p><p className="text-xl font-bold font-data text-violet-400">{(cu?.suggestions ?? 0).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Accepted</p><p className="text-xl font-bold font-data">{(cu?.acceptances ?? 0).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Accept Rate</p><p className="text-xl font-bold font-data text-emerald-500">{pct(cu?.acceptances ?? 0, cu?.suggestions ?? 0)}</p></div>
                <div><p className="text-xs text-muted-foreground">Active Seats</p><p className="text-xl font-bold font-data">{seats["cursor"]?.activeSeats ?? "-"}</p></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">Seat Cost (30d)</p>
                <p className="text-lg font-bold font-data text-amber-500">{fmtUsd(seats["cursor"]?.totalCostUsd ?? 0)}</p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Daily Sessions Trend" subtitle="Last 30 days">
          {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : trend.length === 0 ? (
            <EmptyState icon={Code2} title="No trend data" description="Sync data to see trends." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} formatter={(v: unknown, name: unknown) => [String(v), PROVIDER_LABELS[String(name ?? "")] ?? String(name ?? "")]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(val) => PROVIDER_LABELS[val] ?? val} />
                {["claude_code", "github_copilot", "cursor"].map((p, i) => (
                  <Line key={p} type="monotone" dataKey={p} stroke={LINE_COLORS[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Acceptance Rate" subtitle="Copilot & Cursor completions">
          {loading ? <div className="h-52 animate-pulse bg-muted rounded" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={acceptanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => v + "%"} />
                <Tooltip {...CHART_TOOLTIP} formatter={(v: unknown) => [Number(v).toFixed(1) + "%", "Accept Rate"]} />
                <Bar dataKey="rate" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* ── User Activity Table ── */}
      <SectionCard title="Developer Activity" noPadding>
        {error ? (
          <EmptyState icon={Users} title="Failed to load" description={error} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["User", "Provider", "Sessions", "Commits", "PRs", "Suggestions", "Accepted", "Cost"].map((h) => <th key={h} className={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                  : users.length === 0
                  ? <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No developer activity found.</td></tr>
                  : users.slice(0, 20).map((u, i) => (
                    <tr key={i} className={TR}>
                      <td className={TD + " font-data text-xs"}>{u.userEmail}</td>
                      <td className={TD}><span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{PROVIDER_LABELS[u.provider] ?? u.provider}</span></td>
                      <td className={TD_MONO}>{u.sessions}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{u.commits || "-"}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{u.prs || "-"}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{u.suggestions || "-"}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>
                        {u.suggestions ? `${u.acceptances} (${pct(u.acceptances, u.suggestions)})` : "-"}
                      </td>
                      <td className={TD_MONO + " font-bold text-foreground"}>{fmtUsd(u.costUsd)}</td>
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
