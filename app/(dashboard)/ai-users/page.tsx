"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { Users, DollarSign, Zap, Code2 } from "lucide-react";
import { TH, TR, TD, TD_MONO, TEAM_PILL } from "@/lib/table-styles";

type UserRow = {
  id: string; name: string; email: string; role: string;
  team: string | null; teamId: string | null;
  totalCostUsd: number; totalTokens: number;
  apiCostUsd: number; devAiSessions: number;
  suggestions: number; acceptances: number;
};

function fmtUsd(n: number) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
function pct(num: number, den: number) { return den ? ((num / den) * 100).toFixed(0) + "%" : "—"; }

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers]     = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setUsers(d.users ?? []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost    = users.reduce((s, u) => s + Number(u.totalCostUsd), 0);
  const totalTokens  = users.reduce((s, u) => s + Number(u.totalTokens), 0);
  const totalSessions= users.reduce((s, u) => s + u.devAiSessions, 0);

  return (
    <PageShell title="AI Users" subtitle="All users with multi-provider AI usage across the last 30 days">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard label="Total Users"       value={String(users.length)}    icon={Users}      iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
            <StatCard label="Total Cost (30d)"  value={fmtUsd(totalCost)}       icon={DollarSign} iconColor="text-amber-500"   iconBg="bg-amber-500/10" />
            <StatCard label="Total Tokens"      value={fmtTokens(totalTokens)}  icon={Zap}        iconColor="text-indigo-500"  iconBg="bg-indigo-500/10" />
            <StatCard label="Dev AI Sessions"   value={totalSessions.toLocaleString()} icon={Code2} iconColor="text-cyan-500" iconBg="bg-cyan-500/10" />
          </>
        )}
      </div>

      {/* Users Table */}
      <SectionCard title="All Users" noPadding>
        {/* Search */}
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {error ? <EmptyState icon={Users} title="Failed to load users" description={error} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["User", "Team", "Role", "API Tokens", "API Cost", "Dev Sessions", "Copilot Rate", "Total Cost"].map(h => <th key={h} className={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                  : filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No users found.</td></tr>
                  ) : filtered.map(u => (
                    <tr
                      key={u.id}
                      className={TR + " cursor-pointer"}
                      onClick={() => router.push("/ai-users/" + u.id)}
                    >
                      <td className={TD}>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </td>
                      <td className={TD}>
                        {u.team ? <span className={TEAM_PILL}>{u.team}</span> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className={TD}>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">{u.role}</span>
                      </td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(u.totalTokens)}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{fmtUsd(u.apiCostUsd)}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{u.devAiSessions || "—"}</td>
                      <td className={TD_MONO + " text-muted-foreground"}>{u.suggestions > 0 ? pct(u.acceptances, u.suggestions) : "—"}</td>
                      <td className={TD_MONO + " font-bold text-foreground"}>{fmtUsd(u.totalCostUsd)}</td>
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
