import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

/**
 * GET /api/developer-ai-tools?days=30
 * Returns Developer AI data: Claude Code (claudeCodeDaily) + GitHub Copilot + Cursor (developerAiDaily)
 */
export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const since = startOfDay(subDays(new Date(), days));

  // Claude Code from Phase 1 table
  const [ccTotals, ccByUser, ccTrend] = await Promise.all([
    prisma.claudeCodeDaily.aggregate({
      where: { organizationId, date: { gte: since } },
      _sum: { sessions: true, commits: true, pullRequests: true, linesAdded: true, linesRemoved: true, estimatedCostUsd: true },
    }),
    prisma.claudeCodeDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, date: { gte: since } },
      _sum: { sessions: true, commits: true, pullRequests: true, linesAdded: true, estimatedCostUsd: true },
      orderBy: { _sum: { sessions: "desc" } },
    }),
    prisma.claudeCodeDaily.groupBy({
      by: ["date"],
      where: { organizationId, date: { gte: since } },
      _sum: { sessions: true, estimatedCostUsd: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // GitHub Copilot + Cursor from Phase 2 developerAiDaily
  const [devTotals, devByUser, devTrend, seatData] = await Promise.all([
    prisma.developerAiDaily.groupBy({
      by: ["provider"],
      where: { organizationId, date: { gte: since } },
      _sum: { suggestions: true, acceptances: true, completions: true, sessions: true, totalCostUsd: true },
    }),
    prisma.developerAiDaily.groupBy({
      by: ["provider", "userEmail"],
      where: { organizationId, date: { gte: since } },
      _sum: { suggestions: true, acceptances: true, sessions: true, totalCostUsd: true },
      orderBy: { _sum: { sessions: "desc" } },
    }),
    prisma.developerAiDaily.groupBy({
      by: ["provider", "date"],
      where: { organizationId, date: { gte: since } },
      _sum: { suggestions: true, acceptances: true, sessions: true },
      orderBy: { date: "asc" },
    }),
    prisma.seatUsageDaily.groupBy({
      by: ["provider"],
      where: { organizationId, provider: { in: ["github_copilot", "cursor"] }, date: { gte: since } },
      _avg: { activeSeats: true, totalSeats: true },
      _sum: { totalCostUsd: true },
    }),
  ]);

  // Build devTotals map by provider
  const devByProvider: Record<string, { suggestions: number; acceptances: number; sessions: number; totalCostUsd: number }> = {};
  for (const row of devTotals) {
    devByProvider[row.provider] = {
      suggestions:  Number(row._sum.suggestions  ?? 0),
      acceptances:  Number(row._sum.acceptances  ?? 0),
      sessions:     Number(row._sum.sessions     ?? 0),
      totalCostUsd: Number(row._sum.totalCostUsd ?? 0),
    };
  }

  const seatByProvider: Record<string, { activeSeats: number; totalSeats: number; totalCostUsd: number }> = {};
  for (const row of seatData) {
    seatByProvider[row.provider] = {
      activeSeats:  Math.round(Number(row._avg.activeSeats ?? 0)),
      totalSeats:   Math.round(Number(row._avg.totalSeats  ?? 0)),
      totalCostUsd: Number(row._sum.totalCostUsd ?? 0),
    };
  }

  // Trend: combine Claude Code + copilot/cursor into date-keyed rows
  const trendMap = new Map<string, Record<string, number>>();
  for (const row of ccTrend) {
    const d = row.date.toISOString().split("T")[0];
    if (!trendMap.has(d)) trendMap.set(d, {});
    trendMap.get(d)!["claude_code"] = Number(row._sum.sessions ?? 0);
  }
  for (const row of devTrend) {
    const d = row.date.toISOString().split("T")[0];
    if (!trendMap.has(d)) trendMap.set(d, {});
    trendMap.get(d)![row.provider] = Number(row._sum.sessions ?? 0);
  }
  const trend = Array.from(trendMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vals]) => ({ date, ...vals }));

  // Per-user breakdown for table
  const allUsers = [
    ...ccByUser.map((r) => ({
      provider:    "claude_code",
      userEmail:   r.userEmail,
      sessions:    Number(r._sum.sessions     ?? 0),
      commits:     Number(r._sum.commits      ?? 0),
      prs:         Number(r._sum.pullRequests ?? 0),
      linesAdded:  Number(r._sum.linesAdded   ?? 0),
      suggestions: 0,
      acceptances: 0,
      costUsd:     Number(r._sum.estimatedCostUsd ?? 0),
    })),
    ...devByUser.map((r) => ({
      provider:    r.provider,
      userEmail:   r.userEmail,
      sessions:    Number(r._sum.sessions    ?? 0),
      commits:     0,
      prs:         0,
      linesAdded:  0,
      suggestions: Number(r._sum.suggestions ?? 0),
      acceptances: Number(r._sum.acceptances ?? 0),
      costUsd:     Number(r._sum.totalCostUsd ?? 0),
    })),
  ].sort((a, b) => b.sessions - a.sessions);

  return NextResponse.json({
    claudeCode: {
      sessions:    Number(ccTotals._sum.sessions       ?? 0),
      commits:     Number(ccTotals._sum.commits        ?? 0),
      prs:         Number(ccTotals._sum.pullRequests   ?? 0),
      linesAdded:  Number(ccTotals._sum.linesAdded     ?? 0),
      linesRemoved:Number(ccTotals._sum.linesRemoved   ?? 0),
      costUsd:     Number(ccTotals._sum.estimatedCostUsd ?? 0),
    },
    github_copilot: devByProvider["github_copilot"] ?? { suggestions: 0, acceptances: 0, sessions: 0, totalCostUsd: 0 },
    cursor:         devByProvider["cursor"]         ?? { suggestions: 0, acceptances: 0, sessions: 0, totalCostUsd: 0 },
    seats: seatByProvider,
    trend,
    users: allUsers,
  });
}
