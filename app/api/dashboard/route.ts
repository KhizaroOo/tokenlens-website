import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  const [totalCost, totalTokens, activeUsers, dailySpend] = await Promise.all([
    prisma.usageDaily.aggregate({
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    prisma.usageDaily.findMany({
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      select: { date: true, totalCostUsd: true, totalTokens: true },
      orderBy: { date: "asc" },
    }),
    prisma.usageDaily.findMany({
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      distinct: ["userEmail"],
      select: { userEmail: true },
    }),
    prisma.usageDaily.groupBy({
      by: ["date"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const topUsers = await prisma.usageDaily.groupBy({
    by: ["userEmail"],
    where: { organizationId, date: { gte: thirtyDaysAgo } },
    _sum: { totalCostUsd: true, totalTokens: true },
    orderBy: { _sum: { totalCostUsd: "desc" } },
    take: 10,
  });

  return NextResponse.json({
    totalCostUsd: totalCost._sum.totalCostUsd ?? 0,
    totalTokens: totalCost._sum.totalTokens ?? 0,
    activeUsers: activeUsers.length,
    dailySpend: dailySpend.map((d) => ({
      date: d.date,
      cost: Number(d._sum.totalCostUsd ?? 0),
      tokens: d._sum.totalTokens ?? 0,
    })),
    topUsers,
  });
}
