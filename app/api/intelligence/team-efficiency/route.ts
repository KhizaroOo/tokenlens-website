import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") ?? 30), 90);
  const orgId = session.organizationId;
  const since = subDays(new Date(), days);

  const [teams, effRows, trend] = await Promise.all([
    prisma.team.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } }),
    prisma.teamEfficiencyScoreDaily.groupBy({
      by: ["teamId", "status"],
      where: { organizationId: orgId, date: { gte: since } },
      _avg: { score: true, costPerUser: true },
      _sum: { totalSpendUsd: true, prCount: true, commitCount: true, ticketCount: true, activeUsers: true },
    }),
    prisma.teamEfficiencyScoreDaily.findMany({
      where: { organizationId: orgId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { teamId: true, date: true, score: true },
    }),
  ]);

  const teamNameMap = Object.fromEntries(teams.map(t => [t.id, t.name]));

  const result = teams.map(team => {
    const rows = effRows.filter(r => r.teamId === team.id);
    if (rows.length === 0) return null;
    const avgScore = rows.reduce((s, r) => s + Number(r._avg.score ?? 0), 0) / rows.length;
    const status = avgScore >= 75 ? "efficient" : avgScore >= 55 ? "healthy" : avgScore >= 30 ? "needs_review" : "high_waste";

    return {
      teamId: team.id,
      teamName: teamNameMap[team.id],
      score: avgScore.toFixed(1),
      status,
      totalSpend: rows.reduce((s, r) => s + Number(r._sum.totalSpendUsd ?? 0), 0).toFixed(2),
      activeUsers: rows.reduce((s, r) => s + (r._sum.activeUsers ?? 0), 0),
      prCount: rows.reduce((s, r) => s + (r._sum.prCount ?? 0), 0),
      commitCount: rows.reduce((s, r) => s + (r._sum.commitCount ?? 0), 0),
      ticketCount: rows.reduce((s, r) => s + (r._sum.ticketCount ?? 0), 0),
      costPerUser: Number(rows[0]?._avg.costPerUser ?? 0).toFixed(2),
    };
  }).filter(Boolean).sort((a, b) => Number(b!.score) - Number(a!.score));

  // Trend: pivot by team per day
  const trendMap = new Map<string, Record<string, number>>();
  for (const r of trend) {
    const dateKey = format(r.date, "MMM d");
    if (!trendMap.has(dateKey)) trendMap.set(dateKey, { date: dateKey as unknown as number });
    trendMap.get(dateKey)![teamNameMap[r.teamId] ?? r.teamId] = Number(r.score);
  }

  return NextResponse.json({
    teams: result,
    trend: Array.from(trendMap.values()),
    teamNames: teams.map(t => t.name),
  });
}
