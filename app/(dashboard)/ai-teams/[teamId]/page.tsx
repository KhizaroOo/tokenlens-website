"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BackButton } from "@/components/dashboard/BackButton";
import { StatCardSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { TH, TR, TD, TD_MONO, TEAM_PILL, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { UsersRound, DollarSign, Zap, Terminal, GitCommit, AlertTriangle, Bell } from "lucide-react";
import { format } from "date-fns";

type TeamDetail = {
  profile: {
    id: string; name: string; slug: string; memberCount: number;
    activeMemberCount: number; budgetLimit: number | null; budgetUsedPct: number | null;
  };
  usageSummary: {
    totalCost: number; totalTokens: number; inputTokens: number;
    outputTokens: number; cachedTokens: number;
    avgCostPerUser: number; avgTokensPerUser: number;
  };
  claudeCodeSummary: {
    sessions: number; commits: number; pullRequests: number;
    linesAdded: number; linesRemoved: number; estimatedCost: number;
  };
  memberUsage: { email: string; name: string; cost: number; tokens: number; lastActive: string | null }[];
  dailyUsage: { date: string; cost: number; tokens: number }[];
  ccDailyActivity: { date: string; sessions: number; commits: number; prs: number }[];
  relatedAlerts: { id: string; message: string; severity: string; ruleName: string; createdAt: string; resolvedAt: string | null }[];
};

function fmtUsd(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [data, setData] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/details?days=30`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <PageShell title="Team Details" subtitle="Loading…">
        <BackButton href="/ai-teams" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="Team Details" subtitle="">
        <BackButton href="/ai-teams" />
        <EmptyState icon={UsersRound} title="Team not found" description={error ?? "Could not load team details."} />
      </PageShell>
    );
  }

  const { profile, usageSummary: u, claudeCodeSummary: cc, memberUsage, dailyUsage, ccDailyActivity, relatedAlerts } = data;

  return (
    <PageShell title={profile.name} subtitle={`${profile.memberCount} members · ${profile.activeMemberCount} active`}>
      <BackButton href="/ai-teams" />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Cost (30d)"   value={fmtUsd(u.totalCost)}        icon={DollarSign}  iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
        <StatCard label="Total Tokens (30d)" value={fmtTokens(u.totalTokens)}   icon={Zap}         iconColor="text-cyan-500"    iconBg="bg-cyan-500/10"    />
        <StatCard label="CC Sessions"        value={String(cc.sessions)}         icon={Terminal}    iconColor="text-indigo-500"  iconBg="bg-indigo-500/10"  />
        <StatCard label="CC Commits"         value={String(cc.commits)}          icon={GitCommit}   iconColor="text-amber-500"   iconBg="bg-amber-500/10"   />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <SectionCard title="Team Profile">
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex-shrink-0">
                <UsersRound className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.memberCount} members</p>
              </div>
            </div>
            {[
              ["Total Members",  String(profile.memberCount),                    "text-foreground"],
              ["Active Members", String(profile.activeMemberCount),              "text-emerald-500"],
              ["Budget Limit",   profile.budgetLimit ? fmtUsd(profile.budgetLimit) : "Not set", "text-foreground"],
              ["Budget Used",    profile.budgetUsedPct != null ? profile.budgetUsedPct.toFixed(1) + "%" : "—", profile.budgetUsedPct != null && profile.budgetUsedPct > 80 ? "text-amber-500" : "text-foreground"],
              ["Avg Cost/User",  fmtUsd(u.avgCostPerUser),                       "text-foreground"],
              ["Avg Tokens/User",fmtTokens(Math.round(u.avgTokensPerUser)),      "text-foreground"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold font-data tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Usage summary */}
        <SectionCard title="Usage Summary (30d)">
          <div className="space-y-2.5 text-sm">
            {[
              ["Total Cost",      fmtUsd(u.totalCost),            "text-emerald-500"],
              ["Total Tokens",    fmtTokens(u.totalTokens),       "text-cyan-500"],
              ["Input Tokens",    fmtTokens(u.inputTokens),       "text-foreground"],
              ["Output Tokens",   fmtTokens(u.outputTokens),      "text-foreground"],
              ["Cached Tokens",   fmtTokens(u.cachedTokens),      "text-indigo-400"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold font-data tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Claude Code summary */}
        <SectionCard title="Claude Code (30d)">
          <div className="space-y-2.5 text-sm">
            {[
              ["Sessions",       String(cc.sessions),                          "text-emerald-500"],
              ["Commits",        String(cc.commits),                           "text-cyan-500"],
              ["Pull Requests",  String(cc.pullRequests),                      "text-indigo-400"],
              ["Lines Added",    "+" + cc.linesAdded.toLocaleString(),         "text-emerald-400"],
              ["Lines Removed",  "-" + cc.linesRemoved.toLocaleString(),       "text-red-400"],
              ["Est. Cost",      fmtUsd(cc.estimatedCost),                     "text-amber-500"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold font-data tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Daily cost chart */}
      <SectionCard title="Daily Cost Trend">
        {dailyUsage.length === 0 ? <EmptyState icon={DollarSign} title="No usage data" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyUsage} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tg-cost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.emerald} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="cost" stroke={CHART_COLORS.emerald} fill="url(#tg-cost)" strokeWidth={2} dot={false} name="Cost ($)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Claude Code activity */}
      {ccDailyActivity.length > 0 && (
        <SectionCard title="Claude Code Activity">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ccDailyActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="sessions" fill={CHART_COLORS.emerald} radius={[3,3,0,0]} name="Sessions" />
              <Bar dataKey="commits"  fill={CHART_COLORS.cyan}    radius={[3,3,0,0]} name="Commits"  />
              <Bar dataKey="prs"      fill={CHART_COLORS.indigo}  radius={[3,3,0,0]} name="PRs"      />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* Member usage table */}
      <SectionCard title="Member Usage" subtitle="Last 30 days" noPadding>
        {memberUsage.length === 0 ? <EmptyState icon={UsersRound} title="No member data" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Email", "Tokens", "Cost", "Last Active"].map(h => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memberUsage.map((m, i) => (
                  <tr key={i} className={TR}>
                    <td className={TD + " font-semibold text-foreground"}>{m.name}</td>
                    <td className={TD + " text-muted-foreground text-xs"}>{m.email}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(m.tokens)}</td>
                    <td className={TD_MONO + " font-bold text-foreground"}>{fmtUsd(m.cost)}</td>
                    <td className={TD + " text-muted-foreground text-xs"}>
                      {m.lastActive ? format(new Date(m.lastActive), "MMM d") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Related Alerts */}
      {relatedAlerts.length > 0 && (
        <SectionCard title="Related Alerts">
          <div className="space-y-2">
            {relatedAlerts.map(a => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
                <div className={`mt-0.5 flex-shrink-0 rounded-lg p-2 ${a.severity === "warning" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                  <AlertTriangle className={`h-3.5 w-3.5 ${a.severity === "critical" ? "text-red-400" : "text-amber-500"}`} />
                </div>
                <div>
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(a.createdAt), "MMM d, yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}
