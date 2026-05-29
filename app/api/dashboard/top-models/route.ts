import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRangeStart, parseDays } from "@/lib/query-helpers";

export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const days = parseDays(req.nextUrl.searchParams);
  const since = getDateRangeStart(days);

  const models = await prisma.modelUsageDaily.groupBy({
    by: ["model"],
    where: { organizationId, date: { gte: since } },
    _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true, cachedTokens: true },
    orderBy: { _sum: { totalCostUsd: "desc" } },
  });

  const totalCost = models.reduce((s, m) => s + Number(m._sum.totalCostUsd ?? 0), 0);
  const totalTokens = models.reduce((s, m) => s + (m._sum.totalTokens ?? 0), 0);

  return NextResponse.json({
    models: models.map(m => ({
      model: m.model,
      cost: Number(m._sum.totalCostUsd ?? 0),
      costShare: totalCost > 0 ? (Number(m._sum.totalCostUsd ?? 0) / totalCost) * 100 : 0,
      tokens: m._sum.totalTokens ?? 0,
      tokenShare: totalTokens > 0 ? ((m._sum.totalTokens ?? 0) / totalTokens) * 100 : 0,
      inputTokens: m._sum.inputTokens ?? 0,
      outputTokens: m._sum.outputTokens ?? 0,
      cachedTokens: m._sum.cachedTokens ?? 0,
    })),
  });
}
