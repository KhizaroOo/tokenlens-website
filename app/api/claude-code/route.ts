import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  const [totals, byUser, weekly] = await Promise.all([
    prisma.claudeCodeDaily.aggregate({
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { sessions: true, commits: true, pullRequests: true, linesAdded: true, estimatedCostUsd: true },
    }),
    prisma.claudeCodeDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { sessions: true, commits: true, pullRequests: true, linesAdded: true, estimatedCostUsd: true },
      orderBy: { _sum: { estimatedCostUsd: "desc" } },
      take: 20,
    }),
    prisma.claudeCodeDaily.groupBy({
      by: ["date"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { sessions: true, commits: true, pullRequests: true },
      orderBy: { date: "asc" },
    }),
  ]);

  return NextResponse.json({ totals: totals._sum, byUser, weekly });
}
