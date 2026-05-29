import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRangeStart, parseDays } from "@/lib/query-helpers";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ modelName: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const modelName = decodeURIComponent((await params).modelName);
  const days = parseDays(req.nextUrl.searchParams, 30);
  const since = getDateRangeStart(days);

  const [agg, dailyUsage, allModelsAgg] = await Promise.all([
    prisma.modelUsageDaily.aggregate({
      where: { organizationId, model: modelName, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true, cachedTokens: true },
      _max: { date: true },
      _count: true,
    }),
    prisma.modelUsageDaily.groupBy({
      by: ["date"],
      where: { organizationId, model: modelName, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true, cachedTokens: true },
      orderBy: { date: "asc" },
    }),
    prisma.modelUsageDaily.aggregate({
      where: { organizationId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
  ]);

  const totalCost = Number(agg._sum.totalCostUsd ?? 0);
  const allCost = Number(allModelsAgg._sum.totalCostUsd ?? 0);
  const allTokens = allModelsAgg._sum.totalTokens ?? 0;

  // Highest cost day
  const highestDay = dailyUsage.reduce(
    (best, d) => {
      const cost = Number(d._sum.totalCostUsd ?? 0);
      return cost > best.cost ? { date: d.date, cost } : best;
    },
    { date: null as Date | null, cost: 0 }
  );

  const activeDays = agg._count;
  const avgDailyCost = activeDays > 0 ? totalCost / activeDays : 0;

  return NextResponse.json({
    profile: {
      model: modelName,
      provider: "anthropic",
      totalCost,
      totalTokens: agg._sum.totalTokens ?? 0,
      inputTokens: agg._sum.inputTokens ?? 0,
      outputTokens: agg._sum.outputTokens ?? 0,
      cachedTokens: agg._sum.cachedTokens ?? 0,
      costShare: allCost > 0 ? (totalCost / allCost) * 100 : 0,
      tokenShare: allTokens > 0 ? ((agg._sum.totalTokens ?? 0) / allTokens) * 100 : 0,
    },
    costAnalytics: {
      avgDailyCost,
      highestCostDay: highestDay.date ? { date: highestDay.date, cost: highestDay.cost } : null,
      forecast30d: avgDailyCost * 30,
    },
    dailyUsage: dailyUsage.map(d => ({
      date: format(new Date(d.date), "MMM d"),
      cost: Number(d._sum.totalCostUsd ?? 0),
      tokens: d._sum.totalTokens ?? 0,
      input: d._sum.inputTokens ?? 0,
      output: d._sum.outputTokens ?? 0,
      cached: d._sum.cachedTokens ?? 0,
    })),
    // User and team breakdowns not available (ModelUsageDaily doesn't have userEmail or teamId columns)
    userBreakdown: null,
    teamBreakdown: null,
    relatedAlerts: [],
  });
}
