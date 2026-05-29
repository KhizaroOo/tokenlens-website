import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRangeStart, parseDays } from "@/lib/query-helpers";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const { userId } = await params;
  const days = parseDays(req.nextUrl.searchParams, 30);
  const since = getDateRangeStart(days);

  // Verify user belongs to this org
  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId },
    include: {
      user: {
        include: { teamMembers: { include: { team: true } } },
      },
    },
  });

  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = membership.user;
  const userEmail = user.email;
  const team = user.teamMembers[0]?.team ?? null;

  const [usageAgg, ccAgg, dailyUsage, modelBreakdown, recentUsage, relatedAlerts, aiSpendByProvider, devAiByProvider] = await Promise.all([
    prisma.usageDaily.aggregate({
      where: { organizationId, userEmail, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true, cachedTokens: true },
      _max: { date: true },
      _count: true,
    }),
    prisma.claudeCodeDaily.aggregate({
      where: { organizationId, userEmail, date: { gte: since } },
      _sum: { sessions: true, commits: true, pullRequests: true, linesAdded: true, linesRemoved: true, estimatedCostUsd: true },
    }),
    prisma.usageDaily.groupBy({
      by: ["date"],
      where: { organizationId, userEmail, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { date: "asc" },
    }),
    // Model breakdown for this user — approximate via org-level model data on same days user was active
    // Since we don't have per-user model breakdowns, we return null indicating not available
    Promise.resolve(null),
    prisma.usageDaily.findMany({
      where: { organizationId, userEmail },
      orderBy: { date: "desc" },
      take: 30,
      select: { date: true, inputTokens: true, outputTokens: true, cachedTokens: true, totalTokens: true, totalCostUsd: true },
    }),
    prisma.alert.findMany({
      where: {
        organizationId,
        message: { contains: userEmail },
      },
      include: { alertRule: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Phase 2: AI spend breakdown by provider
    prisma.aiUsageDaily.groupBy({
      by: ["provider"],
      where: { organizationId, userEmail, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
    }),
    // Phase 2: Developer AI breakdown by provider
    prisma.developerAiDaily.groupBy({
      by: ["provider"],
      where: { organizationId, userEmail, date: { gte: since } },
      _sum: { sessions: true, suggestions: true, acceptances: true, totalCostUsd: true },
    }),
  ]);

  const totalCost = Number(usageAgg._sum.totalCostUsd ?? 0);
  const totalTokens = usageAgg._sum.totalTokens ?? 0;
  const activeDays = usageAgg._count;
  const ccSessions = ccAgg._sum.sessions ?? 0;
  const ccCost = Number(ccAgg._sum.estimatedCostUsd ?? 0);

  // Find highest usage day
  const highestDay = dailyUsage.reduce(
    (best, d) => {
      const cost = Number(d._sum.totalCostUsd ?? 0);
      return cost > best.cost ? { date: d.date, cost } : best;
    },
    { date: null as Date | null, cost: 0 }
  );

  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.role,
      team: team ? { id: team.id, name: team.name } : null,
      joinedAt: membership.joinedAt,
      lastActiveDate: usageAgg._max.date ?? null,
    },
    usageSummary: {
      totalCost,
      totalTokens,
      inputTokens: usageAgg._sum.inputTokens ?? 0,
      outputTokens: usageAgg._sum.outputTokens ?? 0,
      cachedTokens: usageAgg._sum.cachedTokens ?? 0,
      avgDailyCost: activeDays > 0 ? totalCost / activeDays : 0,
      avgDailyTokens: activeDays > 0 ? totalTokens / activeDays : 0,
      activeDays,
      highestCostDay: highestDay.date ? {
        date: highestDay.date,
        cost: highestDay.cost,
      } : null,
    },
    claudeCodeSummary: {
      sessions: ccSessions,
      commits: ccAgg._sum.commits ?? 0,
      pullRequests: ccAgg._sum.pullRequests ?? 0,
      linesAdded: ccAgg._sum.linesAdded ?? 0,
      linesRemoved: ccAgg._sum.linesRemoved ?? 0,
      estimatedCost: ccCost,
      costPerSession: ccSessions > 0 ? ccCost / ccSessions : 0,
    },
    modelBreakdown: null, // Per-user model breakdown not available in current schema (UsageDaily doesn't have model column)
    dailyUsage: dailyUsage.map(d => ({
      date: format(new Date(d.date), "MMM d"),
      cost: Number(d._sum.totalCostUsd ?? 0),
      tokens: d._sum.totalTokens ?? 0,
      input: d._sum.inputTokens ?? 0,
      output: d._sum.outputTokens ?? 0,
    })),
    recentActivity: recentUsage.map(r => ({
      date: format(new Date(r.date), "MMM d, yyyy"),
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      cachedTokens: r.cachedTokens,
      totalTokens: r.totalTokens,
      cost: Number(r.totalCostUsd),
    })),
    relatedAlerts: relatedAlerts.map(a => ({
      id: a.id,
      message: a.message,
      severity: a.severity,
      ruleName: a.alertRule.name,
      createdAt: a.createdAt,
      resolvedAt: a.resolvedAt,
    })),
    // Multi-provider breakdown
    providerBreakdown: [
      // Anthropic from usageDaily
      {
        provider: "anthropic",
        label: "Claude (Anthropic)",
        totalCostUsd: totalCost,
        totalTokens:  Number(usageAgg._sum.totalTokens  ?? 0),
        inputTokens:  Number(usageAgg._sum.inputTokens  ?? 0),
        outputTokens: Number(usageAgg._sum.outputTokens ?? 0),
        sessions: 0, suggestions: 0, acceptances: 0,
        category: "api_spend",
      },
      // Other API spend providers
      ...aiSpendByProvider.map(r => ({
        provider: r.provider,
        label: ({ openai: "OpenAI" } as Record<string,string>)[r.provider] ?? r.provider,
        totalCostUsd: Number(r._sum.totalCostUsd  ?? 0),
        totalTokens:  Number(r._sum.totalTokens   ?? 0),
        inputTokens:  Number(r._sum.inputTokens   ?? 0),
        outputTokens: Number(r._sum.outputTokens  ?? 0),
        sessions: 0, suggestions: 0, acceptances: 0,
        category: "api_spend",
      })),
      // Developer AI
      ...devAiByProvider.map(r => ({
        provider: r.provider,
        label: ({ claude_code: "Claude Code", github_copilot: "GitHub Copilot", cursor: "Cursor" } as Record<string,string>)[r.provider] ?? r.provider,
        totalCostUsd: Number(r._sum.totalCostUsd  ?? 0),
        totalTokens:  0,
        inputTokens:  0,
        outputTokens: 0,
        sessions:     Number(r._sum.sessions      ?? 0),
        suggestions:  Number(r._sum.suggestions   ?? 0),
        acceptances:  Number(r._sum.acceptances   ?? 0),
        category: "developer_ai",
      })),
    ].filter(p => p.totalCostUsd > 0 || p.sessions > 0 || p.suggestions > 0),
  });
}
