import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

/**
 * GET /api/developer-ai-tools/[provider]?days=30
 * provider: claude-code | github-copilot | cursor  (kebab-case)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const { provider: providerSlug } = await params;
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const since = startOfDay(subDays(new Date(), days));

  // Map URL slug → DB provider key
  const providerKey = providerSlug === "claude-code" ? "claude_code"
    : providerSlug === "github-copilot" ? "github_copilot"
    : providerSlug === "cursor" ? "cursor"
    : null;

  if (!providerKey) return NextResponse.json({ error: "Unknown provider" }, { status: 400 });

  if (providerKey === "claude_code") {
    // Claude Code data lives in claudeCodeDaily (Phase 1 table)
    const [totals, byUser, trend, byTeam] = await Promise.all([
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
        _sum: { sessions: true, commits: true, estimatedCostUsd: true },
        orderBy: { date: "asc" },
      }),
      prisma.claudeCodeDaily.groupBy({
        by: ["teamId"],
        where: { organizationId, date: { gte: since }, teamId: { not: null } },
        _sum: { sessions: true, estimatedCostUsd: true },
        orderBy: { _sum: { sessions: "desc" } },
      }),
    ]);

    return NextResponse.json({
      provider: "claude_code",
      totals: {
        sessions:    Number(totals._sum.sessions       ?? 0),
        commits:     Number(totals._sum.commits        ?? 0),
        prs:         Number(totals._sum.pullRequests   ?? 0),
        linesAdded:  Number(totals._sum.linesAdded     ?? 0),
        linesRemoved:Number(totals._sum.linesRemoved   ?? 0),
        costUsd:     Number(totals._sum.estimatedCostUsd ?? 0),
        suggestions: 0, acceptances: 0,
      },
      byUser: byUser.map(r => ({
        userEmail:   r.userEmail,
        sessions:    Number(r._sum.sessions     ?? 0),
        commits:     Number(r._sum.commits      ?? 0),
        prs:         Number(r._sum.pullRequests ?? 0),
        linesAdded:  Number(r._sum.linesAdded   ?? 0),
        suggestions: 0, acceptances: 0,
        costUsd:     Number(r._sum.estimatedCostUsd ?? 0),
      })),
      trend: trend.map(r => ({
        date:    r.date.toISOString().split("T")[0],
        sessions: Number(r._sum.sessions ?? 0),
        commits:  Number(r._sum.commits  ?? 0),
        costUsd:  Number(r._sum.estimatedCostUsd ?? 0),
      })),
      byTeam: byTeam.map(r => ({ teamId: r.teamId, sessions: Number(r._sum.sessions ?? 0), costUsd: Number(r._sum.estimatedCostUsd ?? 0) })),
      seats: null,
    });
  }

  // GitHub Copilot or Cursor — from developerAiDaily
  const [totals, byUser, trend, seatData] = await Promise.all([
    prisma.developerAiDaily.aggregate({
      where: { organizationId, provider: providerKey, date: { gte: since } },
      _sum: { suggestions: true, acceptances: true, completions: true, sessions: true, totalCostUsd: true },
    }),
    prisma.developerAiDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, provider: providerKey, date: { gte: since } },
      _sum: { suggestions: true, acceptances: true, sessions: true, totalCostUsd: true },
      orderBy: { _sum: { sessions: "desc" } },
    }),
    prisma.developerAiDaily.groupBy({
      by: ["date"],
      where: { organizationId, provider: providerKey, date: { gte: since } },
      _sum: { suggestions: true, acceptances: true, sessions: true },
      orderBy: { date: "asc" },
    }),
    prisma.seatUsageDaily.findFirst({
      where: { organizationId, provider: providerKey },
      orderBy: { date: "desc" },
    }),
  ]);

  return NextResponse.json({
    provider: providerKey,
    totals: {
      sessions:    Number(totals._sum.sessions    ?? 0),
      commits:     0, prs: 0, linesAdded: 0, linesRemoved: 0,
      suggestions: Number(totals._sum.suggestions ?? 0),
      acceptances: Number(totals._sum.acceptances ?? 0),
      costUsd:     Number(totals._sum.totalCostUsd ?? 0),
    },
    byUser: byUser.map(r => ({
      userEmail:   r.userEmail,
      sessions:    Number(r._sum.sessions    ?? 0),
      suggestions: Number(r._sum.suggestions ?? 0),
      acceptances: Number(r._sum.acceptances ?? 0),
      commits: 0, prs: 0, linesAdded: 0,
      costUsd:     Number(r._sum.totalCostUsd ?? 0),
    })),
    trend: trend.map(r => ({
      date:        r.date.toISOString().split("T")[0],
      sessions:    Number(r._sum.sessions    ?? 0),
      suggestions: Number(r._sum.suggestions ?? 0),
      acceptances: Number(r._sum.acceptances ?? 0),
    })),
    byTeam: [],
    seats: seatData ? {
      totalSeats:   Number(seatData.totalSeats),
      activeSeats:  Number(seatData.activeSeats),
      costPerSeat:  Number(seatData.costPerSeat),
      totalCostUsd: Number(seatData.totalCostUsd),
    } : null,
  });
}
