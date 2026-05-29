import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

/**
 * GET /api/business-productivity-ai?days=30
 * Returns Microsoft Copilot usage data: app breakdown, seat usage, daily trend
 */
export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const since = startOfDay(subDays(new Date(), days));

  const [byApp, trend, seatData] = await Promise.all([
    prisma.businessAiDaily.groupBy({
      by: ["app"],
      where: { organizationId, date: { gte: since } },
      _sum: { activeUsers: true, totalSessions: true, totalCostUsd: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.businessAiDaily.groupBy({
      by: ["date"],
      where: { organizationId, date: { gte: since } },
      _sum: { activeUsers: true, totalSessions: true, totalCostUsd: true },
      orderBy: { date: "asc" },
    }),
    prisma.seatUsageDaily.findMany({
      where: { organizationId, provider: "microsoft_copilot", date: { gte: since } },
      select: { date: true, totalSeats: true, activeSeats: true, costPerSeat: true, totalCostUsd: true },
      orderBy: { date: "desc" },
      take: 1,
    }),
  ]);

  const appTotals = byApp.map((r) => ({
    app:           r.app,
    activeUsers:   Number(r._sum.activeUsers   ?? 0),
    totalSessions: Number(r._sum.totalSessions ?? 0),
    totalCostUsd:  Number(r._sum.totalCostUsd  ?? 0),
  }));

  const trendData = trend.map((r) => ({
    date:          r.date.toISOString().split("T")[0],
    activeUsers:   Number(r._sum.activeUsers   ?? 0),
    totalSessions: Number(r._sum.totalSessions ?? 0),
    totalCostUsd:  Number(r._sum.totalCostUsd  ?? 0),
  }));

  const seat = seatData[0] ?? null;

  const totals = {
    activeUsers:   appTotals.reduce((s, r) => s + r.activeUsers,   0),
    totalSessions: appTotals.reduce((s, r) => s + r.totalSessions, 0),
    totalCostUsd:  appTotals.reduce((s, r) => s + r.totalCostUsd,  0),
    totalSeats:    seat ? Number(seat.totalSeats)  : 0,
    activeSeats:   seat ? Number(seat.activeSeats) : 0,
    costPerSeat:   seat ? Number(seat.costPerSeat) : 30,
  };

  return NextResponse.json({ totals, byApp: appTotals, trend: trendData });
}
