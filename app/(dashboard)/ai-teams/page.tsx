"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { Button } from "@/components/ui/button";
import { UsersRound, DollarSign, Zap, Plus, X, UserPlus, Trash2, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TH, TR, TD, TD_MONO, CHART_TOOLTIP, CHART_COLORS } from "@/lib/table-styles";

// ── Types ──────────────────────────────────────────────────────────────────────
type TeamRow = { id: string; name: string; slug: string; memberCount: number; totalCostUsd: number; totalTokens: number; devSessions: number };
type OrgUser = { id: string; name: string; email: string; role: string; team: string | null };
type TeamMember = { userId: string; name: string; email: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtUsd(n: number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

// ── Modal: Create Team ─────────────────────────────────────────────────────────
function CreateTeamModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(d.error ?? "Failed to create team"); return; }
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-foreground">Create Team</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Team Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI R&D, Web, Mobile…"
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
            {err && <p className="mt-1.5 text-xs text-red-400">{err}</p>}
          </div>
          <p className="text-xs text-muted-foreground">
            After creating the team you can assign users from your Claude API users list.
          </p>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={!name.trim() || saving}
            >
              {saving ? "Creating…" : "Create Team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal: Manage Members ──────────────────────────────────────────────────────
function ManageMembersModal({
  team,
  allUsers,
  onClose,
  onChanged,
}: {
  team: TeamRow;
  allUsers: OrgUser[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    const res = await fetch(`/api/teams/${team.id}/members`);
    const d = await res.json();
    setMembers(d.members ?? []);
    setLoadingMembers(false);
  }, [team.id]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const memberIds = new Set(members.map((m) => m.userId));
  const unassigned = allUsers.filter((u) => !memberIds.has(u.id));

  async function addUser(userId: string) {
    setBusyId(userId);
    await fetch(`/api/teams/${team.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    await fetchMembers();
    onChanged();
    setBusyId(null);
  }

  async function removeUser(userId: string) {
    setBusyId(userId);
    await fetch(`/api/teams/${team.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    await fetchMembers();
    onChanged();
    setBusyId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Manage Members — {team.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Assign users discovered from the Claude API to this team.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden divide-x divide-border">
          {/* Current members */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <p className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase border-b border-border">
              Current Members ({members.length})
            </p>
            <div className="flex-1 overflow-y-auto">
              {loadingMembers ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No members yet.</div>
              ) : (
                members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-[10px] font-bold text-white">
                      {m.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                    </div>
                    <button
                      onClick={() => removeUser(m.userId)}
                      disabled={busyId === m.userId}
                      title="Remove from team"
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Unassigned users */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <p className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase border-b border-border">
              Available Users ({unassigned.length})
            </p>
            <div className="flex-1 overflow-y-auto">
              {unassigned.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">All org users are assigned.</div>
              ) : (
                unassigned.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted border border-border text-[10px] font-bold text-muted-foreground">
                      {u.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <button
                      onClick={() => addUser(u.id)}
                      disabled={busyId === u.id}
                      title="Add to team"
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 transition-all disabled:opacity-40"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 flex justify-end flex-shrink-0">
          <Button onClick={onClose} variant="outline">Done</Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [allUsers, setAllUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [manageTeam, setManageTeam] = useState<TeamRow | null>(null);

  const loadTeams = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(([td, ud]) => {
        if (td.error) throw new Error(td.error);
        setTeams(td.teams ?? []);
        setAllUsers(ud.users ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  const totalCost   = teams.reduce((s, t) => s + t.totalCostUsd, 0);
  const totalTokens = teams.reduce((s, t) => s + t.totalTokens, 0);
  const chartData   = teams.map((t) => ({ name: t.name, cost: t.totalCostUsd }));

  return (
    <>
      <PageShell
        title="AI Teams"
        subtitle="Token usage and cost by team"
        actions={
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1.5"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Team
          </Button>
        }
      >
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Total Teams"  value={String(teams.length)}    icon={UsersRound} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
              <StatCard label="Total Spend"  value={fmtUsd(totalCost)}        icon={DollarSign} iconColor="text-indigo-500"  iconBg="bg-indigo-500/10"  />
              <StatCard label="Total Tokens" value={fmtTokens(totalTokens)}   icon={Zap}        iconColor="text-cyan-500"    iconBg="bg-cyan-500/10"    />
            </>
          )}
        </div>

        {/* ── Cost by Team chart ── */}
        <SectionCard title="Cost by Team" subtitle="Last 30 days">
          {loading ? (
            <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
          ) : chartData.length === 0 ? (
            <EmptyState icon={UsersRound} title="No teams yet" description="Create your first team to see cost breakdown." />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 44)}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${Number(v).toFixed(0)}`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Cost"]} />
                <Bar dataKey="cost" fill={CHART_COLORS.emerald} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* ── Team summary table ── */}
        <SectionCard title="Team Summary" noPadding>
          {error ? (
            <EmptyState icon={UsersRound} title="Failed to load teams" description={error} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Team", "Members", "Tokens", "Dev Sessions", "Cost", "Avg Cost/Member", ""].map((h, i) => (
                      <th key={i} className={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                    : teams.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                          No teams yet. Click &ldquo;Create Team&rdquo; to get started.
                        </td>
                      </tr>
                    )
                    : teams.map((team) => (
                      <tr key={team.id} className={TR}>
                        <td
                          className={TD + " font-semibold cursor-pointer"}
                          onClick={() => router.push("/ai-teams/" + team.id)}
                        >
                          <span className="text-foreground hover:text-emerald-400 transition-colors">
                            {team.name}
                          </span>
                        </td>
                        <td className={TD_MONO + " text-muted-foreground"}>{team.memberCount}</td>
                        <td className={TD_MONO + " text-muted-foreground"}>{fmtTokens(team.totalTokens)}</td>
                        <td className={TD_MONO + " text-muted-foreground"}>{(team.devSessions ?? 0) || "—"}</td>
                        <td className={TD_MONO + " font-bold text-foreground"}>{fmtUsd(team.totalCostUsd)}</td>
                        <td className={TD_MONO + " text-muted-foreground"}>
                          {team.memberCount > 0 ? fmtUsd(team.totalCostUsd / team.memberCount) : "—"}
                        </td>
                        <td className={TD + " text-right"}>
                          <button
                            onClick={() => setManageTeam(team)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                          >
                            <Users className="h-3 w-3" />
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </PageShell>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={loadTeams}
        />
      )}
      {manageTeam && (
        <ManageMembersModal
          team={manageTeam}
          allUsers={allUsers}
          onClose={() => setManageTeam(null)}
          onChanged={loadTeams}
        />
      )}
    </>
  );
}
