"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BackButton } from "@/components/dashboard/BackButton";
import { StatCardSkeleton, TableRowSkeleton, ChartSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { TH, TR, TD, TD_MONO, TEAM_PILL, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  User, DollarSign, Zap, Terminal, GitCommit, GitPullRequest,
  ArrowUpRight, AlertTriangle, Bell, Calendar, TrendingUp, Lightbulb,
} from "lucide-react";
import { format } from "date-fns";

type ProviderBreakdown = {
  provider: string;
  label: string;
  totalCostUsd: number;
  totalTokens: number;
  sessions: number;
  category: string;
};

type AiHealthData = {
  adoptionScore: number;
  adoptionBadge: string;
  wasteScore: number;
  inactiveSeatWarning: boolean;
  providerBreakdown: ProviderBreakdown[];
  recommendations: { id: string; title: string; priority: string }[];
};

type DetailData = {
  profile: {
    id: string; name: string; email: string; role: string;
    team: { id: string; name: string } | null;
    joinedAt: string; lastActiveDate: string | null;
  };
  usageSummary: {
    totalCost: number; totalTokens: number; inputTokens: number;
    outputTokens: number; cachedTokens: number; avgDailyCost: number;
    avgDailyTokens: number; activeDays: number;
    highestCostDay: { date: string; cost: number } | null;
  };
  claudeCodeSummary: {
    sessions: number; commits: number; pullRequests: number;
    linesAdded: number; linesRemoved: number;
    estimatedCost: number; costPerSession: number;
  };
  dailyUsage: { date: string; cost: number; tokens: number; input: number; output: number }[];
  recentActivity: { date: string; inputTokens: number; outputTokens: number; cachedTokens: number; totalTokens: number; cost: number }[];
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

const BADGE_COLOR: Record<string, string> = {
  high:     "text-emerald-400 bg-emerald-400/10",
  healthy:  "text-cyan-400 bg-cyan-400/10",
  low:      "text-amber-400 bg-amber-400/10",
  inactive: "text-white/40 bg-white/5",
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<DetailData | null>(null);
  const [aiHealth, setAiHealth] = useState<AiHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}/details?days=30`).then(r => r.json()),
      fetch(`/api/users/${userId}/ai-health`).then(r => r.json()).catch(() => null),
    ])
      .then(([d, h]) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        if (h && !h.error) setAiHealth(h);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <PageShell title="User Details" subtitle="Loading…">
        <BackButton href="/ai-users" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="User Details" subtitle="">
        <BackButton href="/ai-users" />
        <EmptyState icon={User} title="User not found" description={error ?? "Could not load user details."} />
      </PageShell>
    );
  }

  const { profile, usageSummary: u, claudeCodeSummary: cc, dailyUsage, recentActivity, relatedAlerts } = data;

  return (
    <PageShell title={profile.name} subtitle={profile.email}>
      <BackButton href="/ai-users" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Cost (30d)"   value={fmtUsd(u.totalCost)}       icon={DollarSign} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
        <StatCard label="Total Tokens (30d)" value={fmtTokens(u.totalTokens)}  icon={Zap}        iconColor="text-cyan-500"    iconBg="bg-cyan-500/10"    />
        <StatCard label="CC Sessions"        value={String(cc.sessions)}        icon={Terminal}   iconColor="text-indigo-500"  iconBg="bg-indigo-500/10"  />
        <StatCard label="CC Commits"         value={String(cc.commits)}         icon={GitCommit}  iconColor="text-amber-500"   iconBg="bg-amber-500/10"   />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <SectionCard title="Profile">
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex-shrink-0">
                <User className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-semibold text-foreground capitalize">{profile.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Team</span>
                <span className="font-semibold text-foreground">{profile.team?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active</span>
                <span className="font-semibold text-foreground">
                  {profile.lastActiveDate ? format(new Date(profile.lastActiveDate), "MMM d, yyyy") : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-semibold text-foreground">{format(new Date(profile.joinedAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Days</span>
                <span className="font-semibold text-foreground">{u.activeDays}</span>
              </div>
              {u.highestCostDay && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Day</span>
                  <span className="font-semibold text-foreground">{format(new Date(u.highestCostDay.date), "MMM d")} · {fmtUsd(u.highestCostDay.cost)}</span>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Usage Summary */}
        <SectionCard title="Usage Summary (30d)">
          <div className="space-y-2.5 text-sm">
            {[
              ["Total Cost",       fmtUsd(u.totalCost),                 "text-emerald-500"],
              ["Total Tokens",     fmtTokens(u.totalTokens),            "text-cyan-500"],
              ["Input Tokens",     fmtTokens(u.inputTokens),            "text-foreground"],
              ["Output Tokens",    fmtTokens(u.outputTokens),           "text-foreground"],
              ["Cached Tokens",    fmtTokens(u.cachedTokens),           "text-indigo-400"],
              ["Avg Daily Cost",   fmtUsd(u.avgDailyCost),              "text-foreground"],
              ["Avg Daily Tokens", fmtTokens(Math.round(u.avgDailyTokens)), "text-foreground"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold font-data tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Claude Code Summary */}
        <SectionCard title="Claude Code (30d)">
          <div className="space-y-2.5 text-sm">
            {[
              ["Sessions",        String(cc.sessions),              "text-emerald-500"],
              ["Commits",         String(cc.commits),               "text-cyan-500"],
              ["Pull Requests",   String(cc.pullRequests),          "text-indigo-400"],
              ["Lines Added",     "+" + cc.linesAdded.toLocaleString(), "text-emerald-400"],
              ["Lines Removed",   "-" + cc.linesRemoved.toLocaleString(), "text-red-400"],
              ["Est. Cost",       fmtUsd(cc.estimatedCost),         "text-amber-500"],
              ["Cost/Session",    fmtUsd(cc.costPerSession),        "text-foreground"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold font-data tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* AI Health Profile */}
      {aiHealth && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label={`AI Adoption (${aiHealth.adoptionBadge})`}
              value={`${Number(aiHealth.adoptionScore).toFixed(0)} / 100`}
              icon={TrendingUp}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-500/10"
            />
            <StatCard
              label="AI Waste Score"
              value={`${Number(aiHealth.wasteScore).toFixed(0)} / 100`}
              icon={AlertTriangle}
              iconColor={aiHealth.wasteScore > 50 ? "text-red-500" : "text-amber-500"}
              iconBg={aiHealth.wasteScore > 50 ? "bg-red-500/10" : "bg-amber-500/10"}
            />
            <StatCard
              label="Providers Active"
              value={String(aiHealth.providerBreakdown.filter(p => p.totalCostUsd > 0 || p.sessions > 0).length)}
              icon={Zap}
              iconColor="text-cyan-500"
              iconBg="bg-cyan-500/10"
            />
            <StatCard
              label="Seat Warning"
              value={aiHealth.inactiveSeatWarning ? "Review Seats" : "All Active"}
              icon={Lightbulb}
              iconColor={aiHealth.inactiveSeatWarning ? "text-amber-500" : "text-emerald-500"}
              iconBg={aiHealth.inactiveSeatWarning ? "bg-amber-500/10" : "bg-emerald-500/10"}
            />
          </div>

          {/* Provider Breakdown */}
          {aiHealth.providerBreakdown.length > 0 && (
            <SectionCard title="Provider Usage Breakdown" subtitle="Last 30 days, all providers">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {aiHealth.providerBreakdown.map(p => (
                  <div key={p.provider} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.category.replace("_", " ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">${Number(p.totalCostUsd).toFixed(2)}</p>
                      {p.sessions > 0 && <p className="text-xs text-muted-foreground">{p.sessions} sessions</p>}
                      {p.totalTokens > 0 && <p className="text-xs text-muted-foreground">{p.totalTokens >= 1000 ? (p.totalTokens / 1000).toFixed(0) + "K" : p.totalTokens} tokens</p>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Recommendations for this user */}
          {aiHealth.recommendations.length > 0 && (
            <SectionCard title="Recommendations" subtitle="AI insights for this user">
              <div className="space-y-2">
                {aiHealth.recommendations.map(rec => (
                  <div key={rec.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                    <Lightbulb className="h-4 w-4 flex-shrink-0 text-amber-400" />
                    <p className="flex-1 text-sm text-foreground">{rec.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      rec.priority === "critical" ? "text-red-400 bg-red-400/10" :
                      rec.priority === "high" ? "text-amber-400 bg-amber-400/10" :
                      "text-cyan-400 bg-cyan-400/10"
                    }`}>{rec.priority}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {/* Daily cost chart */}
      <SectionCard title="Daily Cost Trend (30d)" subtitle="API usage cost per day">
        {dailyUsage.length === 0 ? (
          <EmptyState icon={DollarSign} title="No usage data" description="No usage recorded in this period." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyUsage} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ug-cost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.emerald} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="cost" stroke={CHART_COLORS.emerald} fill="url(#ug-cost)" strokeWidth={2} dot={false} name="Cost ($)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Daily token chart */}
      <SectionCard title="Daily Token Breakdown" subtitle="Input vs Output tokens per day">
        {dailyUsage.length === 0 ? (
          <EmptyState icon={Zap} title="No token data" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyUsage} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="input"  fill={CHART_COLORS.emerald} radius={[3,3,0,0]} name="Input"  stackId="a" />
              <Bar dataKey="output" fill={CHART_COLORS.cyan}    radius={[3,3,0,0]} name="Output" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Recent Activity */}
      <SectionCard title="Recent Usage" subtitle="Last 30 days, daily rows" noPadding>
        {recentActivity.length === 0 ? (
          <EmptyState icon={Calendar} title="No recent activity" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Input Tokens", "Output Tokens", "Cached", "Total Tokens", "Cost"].map(h => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((r, i) => (
                  <tr key={i} className={TR}>
                    <td className={TD + " text-muted-foreground font-data"}>{r.date}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{r.inputTokens.toLocaleString()}</td>
                    <td className={TD_MONO + " text-muted-foreground"}>{r.outputTokens.toLocaleString()}</td>
                    <td className={TD_MONO + " text-indigo-400"}>{r.cachedTokens.toLocaleString()}</td>
                    <td className={TD_MONO + " text-foreground"}>{r.totalTokens.toLocaleString()}</td>
                    <td className={TD_MONO + " font-bold text-emerald-500"}>{fmtUsd(r.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Related Alerts */}
      {relatedAlerts.length > 0 && (
        <SectionCard title="Related Alerts" subtitle="Alerts triggered for this user">
          <div className="space-y-2">
            {relatedAlerts.map(a => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
                <div className={`mt-0.5 flex-shrink-0 rounded-lg p-2 ${a.severity === "warning" ? "bg-amber-500/10" : a.severity === "critical" ? "bg-red-500/10" : "bg-blue-500/10"}`}>
                  {a.severity === "info" ? <Bell className="h-3.5 w-3.5 text-blue-400" /> : <AlertTriangle className={`h-3.5 w-3.5 ${a.severity === "critical" ? "text-red-400" : "text-amber-500"}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(a.createdAt), "MMM d, yyyy 'at' HH:mm")}</p>
                </div>
                {a.resolvedAt && <span className="text-xs text-emerald-400 flex-shrink-0">Resolved</span>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}
