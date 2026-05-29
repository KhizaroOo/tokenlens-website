import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") ?? 30), 90);
  const orgId = session.organizationId;
  const since = subDays(new Date(), days);

  const [userScores, teamScores, seatData] = await Promise.all([
    prisma.aiWasteScoreDaily.groupBy({
      by: ["entityId"],
      where: { organizationId: orgId, entityType: "user", date: { gte: since } },
      _avg: { score: true },
      _sum: { wastedCostUsd: true, inactiveSeats: true },
    }),
    prisma.aiWasteScoreDaily.groupBy({
      by: ["entityId"],
      where: { organizationId: orgId, entityType: "team", date: { gte: since } },
      _avg: { score: true },
      _sum: { wastedCostUsd: true, inactiveSeats: true },
    }),
    prisma.seatUsageDaily.groupBy({
      by: ["provider"],
      where: { organizationId: orgId, date: { gte: since } },
      _avg: { totalSeats: true, activeSeats: true, costPerSeat: true },
    }),
  ]);

  const teams = await prisma.team.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } });
  const teamNameMap = Object.fromEntries(teams.map(t => [t.id, t.name]));

  const usersResult = userScores.map(u => ({
    entityId: u.entityId,
    score: Number(u._avg.score ?? 0).toFixed(1),
    wastedCost: Number(u._sum.wastedCostUsd ?? 0).toFixed(2),
    inactiveSeats: u._sum.inactiveSeats ?? 0,
  })).sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 20);

  const teamsResult = teamScores.map(t => ({
    entityId: t.entityId,
    teamName: teamNameMap[t.entityId] ?? t.entityId,
    score: Number(t._avg.score ?? 0).toFixed(1),
    wastedCost: Number(t._sum.wastedCostUsd ?? 0).toFixed(2),
    inactiveSeats: t._sum.inactiveSeats ?? 0,
  })).sort((a, b) => Number(b.score) - Number(a.score));

  const inactiveSeatsByProvider = seatData.map(s => ({
    provider: s.provider,
    totalSeats: Math.round(s._avg.totalSeats ?? 0),
    activeSeats: Math.round(s._avg.activeSeats ?? 0),
    inactiveSeats: Math.max(0, Math.round((s._avg.totalSeats ?? 0) - (s._avg.activeSeats ?? 0))),
    costPerSeat: Number(s._avg.costPerSeat ?? 0),
    estimatedMonthlyWaste: (Math.max(0, (s._avg.totalSeats ?? 0) - (s._avg.activeSeats ?? 0)) * Number(s._avg.costPerSeat ?? 0)).toFixed(2),
  }));

  return NextResponse.json({ users: usersResult, teams: teamsResult, inactiveSeatsByProvider });
}
