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

  const [userScores, teamScores] = await Promise.all([
    prisma.aiAdoptionScoreDaily.groupBy({
      by: ["entityId"],
      where: { organizationId: orgId, entityType: "user", date: { gte: since } },
      _avg: { score: true },
      _max: { badge: true, date: true },
      _sum: { totalSessions: true, totalTokens: true },
    }),
    prisma.aiAdoptionScoreDaily.groupBy({
      by: ["entityId"],
      where: { organizationId: orgId, entityType: "team", date: { gte: since } },
      _avg: { score: true },
      _max: { badge: true },
    }),
  ]);

  const teams = await prisma.team.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } });
  const teamNameMap = Object.fromEntries(teams.map(t => [t.id, t.name]));

  const users = userScores.map(u => ({
    entityId: u.entityId,
    score: Number(u._avg.score ?? 0).toFixed(1),
    badge: u._max.badge ?? "inactive",
    totalSessions: u._sum.totalSessions ?? 0,
    totalTokens: u._sum.totalTokens ?? 0,
  })).sort((a, b) => Number(b.score) - Number(a.score));

  const teamsResult = teamScores.map(t => ({
    entityId: t.entityId,
    teamName: teamNameMap[t.entityId] ?? t.entityId,
    score: Number(t._avg.score ?? 0).toFixed(1),
    badge: t._max.badge ?? "inactive",
  })).sort((a, b) => Number(b.score) - Number(a.score));

  // Distribution
  const distribution = { high: 0, healthy: 0, low: 0, inactive: 0 };
  for (const u of users) {
    const s = Number(u.score);
    if (s >= 80) distribution.high++;
    else if (s >= 60) distribution.healthy++;
    else if (s >= 30) distribution.low++;
    else distribution.inactive++;
  }

  return NextResponse.json({ users, teams: teamsResult, distribution });
}
