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

  const [adoptionScores, wasteScores, effScores, recs, seatRows, usageRows, aiUsageRows] = await Promise.all([
    prisma.aiAdoptionScoreDaily.findMany({
      where: { organizationId: orgId, entityType: "org", date: { gte: since } },
      orderBy: { date: "desc" },
      take: 1,
    }),
    prisma.aiWasteScoreDaily.findMany({
      where: { organizationId: orgId, entityType: "team", date: { gte: since } },
      orderBy: { score: "desc" },
      take: 1,
    }),
    prisma.teamEfficiencyScoreDaily.findMany({
      where: { organizationId: orgId, date: { gte: since } },
      orderBy: { score: "desc" },
    }),
    prisma.recommendation.findMany({
      where: { organizationId: orgId, status: "open" },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.seatUsageDaily.groupBy({
      by: ["provider"],
      where: { organizationId: orgId, date: { gte: since } },
      _sum: { totalSeats: true, activeSeats: true },
    }),
    prisma.usageDaily.aggregate({
      where: { organizationId: orgId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      _count: { userEmail: true },
    }),
    prisma.aiUsageDaily.aggregate({
      where: { organizationId: orgId, date: { gte: since } },
      _sum: { totalCostUsd: true },
    }),
  ]);

  const totalAiSpend =
    Number(usageRows._sum.totalCostUsd ?? 0) +
    Number(aiUsageRows._sum.totalCostUsd ?? 0);

  const inactiveSeats = seatRows.reduce((acc, r) => {
    const total = r._sum.totalSeats ?? 0;
    const active = r._sum.activeSeats ?? 0;
    return acc + Math.max(0, total - active);
  }, 0);

  const highestRoiTeam = effScores.length > 0 ? effScores[0] : null;
  const highestWasteTeam = wasteScores.length > 0 ? wasteScores[0] : null;

  // Get unique active users across all usage tables
  const [claudeActiveUsers, aiActiveUsers] = await Promise.all([
    prisma.usageDaily.findMany({
      where: { organizationId: orgId, date: { gte: since } },
      select: { userEmail: true },
      distinct: ["userEmail"],
    }),
    prisma.aiUsageDaily.findMany({
      where: { organizationId: orgId, date: { gte: since } },
      select: { userEmail: true },
      distinct: ["userEmail"],
    }),
  ]);
  const activeUserEmails = new Set([
    ...claudeActiveUsers.map(u => u.userEmail),
    ...aiActiveUsers.map(u => u.userEmail),
  ]);

  const totalSeats = seatRows.reduce((a, r) => a + (r._sum.totalSeats ?? 0), 0);
  const adoptionRate = totalSeats > 0 ? (activeUserEmails.size / totalSeats) * 100 : 0;

  return NextResponse.json({
    totalAiSpend,
    activeUsers: activeUserEmails.size,
    adoptionRate: Math.min(100, adoptionRate).toFixed(1),
    inactiveSeats,
    costPerActiveUser: activeUserEmails.size > 0 ? (totalAiSpend / activeUserEmails.size).toFixed(2) : "0.00",
    highestRoiTeam: highestRoiTeam ? { teamId: highestRoiTeam.teamId, score: Number(highestRoiTeam.score) } : null,
    highestWasteTeam: highestWasteTeam ? { entityId: highestWasteTeam.entityId, score: Number(highestWasteTeam.score) } : null,
    openRecommendations: recs.length,
    topRecommendations: recs,
  });
}
