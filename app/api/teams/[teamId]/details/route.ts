import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRangeStart, parseDays } from "@/lib/query-helpers";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const { teamId } = await params;
  const days = parseDays(req.nextUrl.searchParams, 30);
  const since = getDateRangeStart(days);

  const team = await prisma.team.findFirst({
    where: { id: teamId, organizationId },
    include: {
      members: { include: { user: true } },
      budgets: { where: { period: "monthly" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const memberEmails = team.members.map(m => m.user.email);

  const [usageAgg, ccAgg, dailyUsage, memberUsage, relatedAlerts] = await Promise.all([
    prisma.usageDaily.aggregate({
      where: { organizationId, teamId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true, cachedTokens: true },
    }),
    prisma.claudeCodeDaily.aggregate({
      where: { organizationId, teamId, date: { gte: since } },
      _sum: { sessions: true, commits: true, pullRequests: true, linesAdded: true, linesRemoved: true, estimatedCostUsd: true },
    }),
    prisma.usageDaily.groupBy({
      by: ["date"],
      where: { organizationId, teamId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { date: "asc" },
    }),
    prisma.usageDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, teamId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      _max: { date: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.alert.findMany({
      where: {
        organizationId,
        OR: [
          { message: { contains: team.name } },
          ...memberEmails.map(e => ({ message: { contains: e } })),
        ],
      },
      include: { alertRule: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalCost = Number(usageAgg._sum.totalCostUsd ?? 0);
  const memberCount = team.members.length;
  const budgetLimit = team.budgets[0] ? Number(team.budgets[0].limitUsd) : null;

  const memberMap = Object.fromEntries(team.members.map(m => [m.user.email, m.user]));

  const ccDaily = await prisma.claudeCodeDaily.groupBy({
    by: ["date"],
    where: { organizationId, teamId, date: { gte: since } },
    _sum: { sessions: true, commits: true, pullRequests: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    profile: {
      id: team.id,
      name: team.name,
      slug: team.slug,
      memberCount,
      activeMemberCount: memberUsage.length,
      budgetLimit,
      budgetUsedPct: budgetLimit ? (totalCost / budgetLimit) * 100 : null,
    },
    usageSummary: {
      totalCost,
      totalTokens: usageAgg._sum.totalTokens ?? 0,
      inputTokens: usageAgg._sum.inputTokens ?? 0,
      outputTokens: usageAgg._sum.outputTokens ?? 0,
      cachedTokens: usageAgg._sum.cachedTokens ?? 0,
      avgCostPerUser: memberCount > 0 ? totalCost / memberCount : 0,
      avgTokensPerUser: memberCount > 0 ? (usageAgg._sum.totalTokens ?? 0) / memberCount : 0,
    },
    claudeCodeSummary: {
      sessions: ccAgg._sum.sessions ?? 0,
      commits: ccAgg._sum.commits ?? 0,
      pullRequests: ccAgg._sum.pullRequests ?? 0,
      linesAdded: ccAgg._sum.linesAdded ?? 0,
      linesRemoved: ccAgg._sum.linesRemoved ?? 0,
      estimatedCost: Number(ccAgg._sum.estimatedCostUsd ?? 0),
    },
    memberUsage: memberUsage.map(m => {
      const user = memberMap[m.userEmail];
      return {
        email: m.userEmail,
        name: user?.name ?? m.userEmail,
        cost: Number(m._sum.totalCostUsd ?? 0),
        tokens: m._sum.totalTokens ?? 0,
        lastActive: m._max.date ?? null,
      };
    }),
    dailyUsage: dailyUsage.map(d => ({
      date: format(new Date(d.date), "MMM d"),
      cost: Number(d._sum.totalCostUsd ?? 0),
      tokens: d._sum.totalTokens ?? 0,
    })),
    ccDailyActivity: ccDaily.map(d => ({
      date: format(new Date(d.date), "MMM d"),
      sessions: d._sum.sessions ?? 0,
      commits: d._sum.commits ?? 0,
      prs: d._sum.pullRequests ?? 0,
    })),
    relatedAlerts: relatedAlerts.map(a => ({
      id: a.id,
      message: a.message,
      severity: a.severity,
      ruleName: a.alertRule.name,
      createdAt: a.createdAt,
      resolvedAt: a.resolvedAt,
    })),
  });
}
