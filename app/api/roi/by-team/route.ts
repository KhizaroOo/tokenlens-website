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

  const [teams, effRows, adoptionRows, wasteRows, corrRows] = await Promise.all([
    prisma.team.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } }),
    prisma.teamEfficiencyScoreDaily.groupBy({
      by: ["teamId"],
      where: { organizationId: orgId, date: { gte: since } },
      _avg: { score: true, costPerUser: true },
      _sum: { totalSpendUsd: true, prCount: true, commitCount: true, ticketCount: true, activeUsers: true, devAiSessions: true },
    }),
    prisma.aiAdoptionScoreDaily.groupBy({
      by: ["entityId"],
      where: { organizationId: orgId, entityType: "team", date: { gte: since } },
      _avg: { score: true },
    }),
    prisma.aiWasteScoreDaily.groupBy({
      by: ["entityId"],
      where: { organizationId: orgId, entityType: "team", date: { gte: since } },
      _avg: { score: true },
      _sum: { wastedCostUsd: true, inactiveSeats: true },
    }),
    prisma.productivityCorrelationDaily.groupBy({
      by: ["teamId"],
      where: { organizationId: orgId, teamId: { not: null }, date: { gte: since } },
      _avg: { costPerPr: true, costPerTicket: true },
      _sum: { aiSpendUsd: true, prsMerged: true, ticketsResolved: true },
    }),
  ]);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]));

  const result = teams.map(team => {
    const eff = effRows.find(r => r.teamId === team.id);
    const adopt = adoptionRows.find(r => r.entityId === team.id);
    const waste = wasteRows.find(r => r.entityId === team.id);
    const corr = corrRows.find(r => r.teamId === team.id);

    const score = Number(eff?._avg.score ?? 0);
    const status = score >= 75 ? "efficient" : score >= 55 ? "healthy" : score >= 30 ? "needs_review" : "high_waste";

    return {
      teamId: team.id,
      teamName: teamMap[team.id] ?? team.id,
      efficiencyScore: score.toFixed(1),
      status,
      adoptionScore: Number(adopt?._avg.score ?? 0).toFixed(1),
      wasteScore: Number(waste?._avg.score ?? 0).toFixed(1),
      totalSpend: Number(eff?._sum.totalSpendUsd ?? 0).toFixed(2),
      activeUsers: Number(eff?._sum.activeUsers ?? 0),
      devSessions: Number(eff?._sum.devAiSessions ?? 0),
      prsMerged: Number(corr?._sum.prsMerged ?? eff?._sum.prCount ?? 0),
      ticketsResolved: Number(corr?._sum.ticketsResolved ?? eff?._sum.ticketCount ?? 0),
      costPerPr: corr?._avg.costPerPr ? Number(corr._avg.costPerPr).toFixed(2) : null,
      inactiveSeats: Number(waste?._sum.inactiveSeats ?? 0),
      wastedCost: Number(waste?._sum.wastedCostUsd ?? 0).toFixed(2),
    };
  });

  return NextResponse.json({ teams: result.sort((a, b) => Number(b.efficiencyScore) - Number(a.efficiencyScore)) });
}
