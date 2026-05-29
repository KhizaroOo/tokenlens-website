import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRangeStart, parseDays } from "@/lib/query-helpers";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const days = parseDays(req.nextUrl.searchParams);
  const since = getDateRangeStart(days);

  const [costTrend, modelTrend] = await Promise.all([
    prisma.usageDaily.groupBy({
      by: ["date"],
      where: { organizationId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { date: "asc" },
    }),
    prisma.modelUsageDaily.groupBy({
      by: ["date", "model"],
      where: { organizationId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { date: "asc" },
    }),
  ]);

  return NextResponse.json({
    daily: costTrend.map(d => ({
      date: format(new Date(d.date), "MMM d"),
      cost: Number(d._sum.totalCostUsd ?? 0),
      tokens: d._sum.totalTokens ?? 0,
      input: d._sum.inputTokens ?? 0,
      output: d._sum.outputTokens ?? 0,
    })),
    modelDaily: modelTrend.map(d => ({
      date: format(new Date(d.date), "MMM d"),
      model: d.model,
      cost: Number(d._sum.totalCostUsd ?? 0),
      tokens: d._sum.totalTokens ?? 0,
    })),
  });
}
