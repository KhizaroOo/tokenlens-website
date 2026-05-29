import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRangeStart, parseDays } from "@/lib/query-helpers";
import { subDays, startOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const days = parseDays(req.nextUrl.searchParams);
  const since = getDateRangeStart(days);
  const monthStart = startOfMonth(new Date());

  const [
    periodAgg, monthAgg, userEmails, allUsers,
    teamCount, topUsers, topTeams,
    ccAgg, budget, providerConn,
  ] = await Promise.all([
    prisma.usageDaily.aggregate({
      where: { organizationId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true, cachedTokens: true },
    }),
    prisma.usageDaily.aggregate({
      where: { organizationId, date: { gte: monthStart } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    prisma.usageDaily.findMany({
      where: { organizationId, date: { gte: since } },
      distinct: ["userEmail"],
      select: { userEmail: true },
    }),
    prisma.organizationMember.count({ where: { organizationId } }),
    prisma.team.count({ where: { organizationId } }),
    prisma.usageDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
      take: 5,
    }),
    prisma.usageDaily.groupBy({
      by: ["teamId"],
      where: { organizationId, date: { gte: since }, teamId: { not: null } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
      take: 5,
    }),
    prisma.claudeCodeDaily.aggregate({
      where: { organizationId, date: { gte: since } },
      _sum: { sessions: true, commits: true, pullRequests: true, linesAdded: true, estimatedCostUsd: true },
    }),
    prisma.budget.findFirst({
      where: { organizationId, teamId: null, period: "monthly" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.providerConnection.findUnique({
      where: { organizationId_provider: { organizationId, provider: "anthropic" } },
    }),
  ]);

  // Enrich top teams with names
  const teamIds = topTeams.map(t => t.teamId).filter(Boolean) as string[];
  const teamNames = await prisma.team.findMany({
    where: { id: { in: teamIds } },
    select: { id: true, name: true },
  });
  const teamNameMap = Object.fromEntries(teamNames.map(t => [t.id, t.name]));

  const totalCost = Number(periodAgg._sum.totalCostUsd ?? 0);
  const monthCost = Number(monthAgg._sum.totalCostUsd ?? 0);
  const budgetLimit = budget ? Number(budget.limitUsd) : null;
  const activeUsers = userEmails.length;
  const inactiveUsers = Math.max(0, allUsers - activeUsers);
  const avgCostPerUser = activeUsers > 0 ? totalCost / activeUsers : 0;

  // Cache savings estimate (cached tokens cost ~10x less, so we estimate savings as 90% of what they would have cost as input)
  const cachedTokens = periodAgg._sum.cachedTokens ?? 0;
  const cacheSavingsUsd = cachedTokens * 0.000003 * 0.9; // rough estimate

  const recentAlerts = await prisma.alert.findMany({
    where: { organizationId },
    include: { alertRule: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    period: { days, since },
    spend: {
      period: totalCost,
      currentMonth: monthCost,
      budgetLimit,
      budgetUsedPct: budgetLimit ? (monthCost / budgetLimit) * 100 : null,
      forecast30d: totalCost / days * 30,
      avgPerUser: avgCostPerUser,
      avgPerTeam: teamCount > 0 ? totalCost / teamCount : 0,
    },
    tokens: {
      total: periodAgg._sum.totalTokens ?? 0,
      input: periodAgg._sum.inputTokens ?? 0,
      output: periodAgg._sum.outputTokens ?? 0,
      cached: cachedTokens,
      cacheSavingsUsd,
    },
    users: {
      total: allUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    teams: {
      total: teamCount,
    },
    claudeCode: {
      sessions: ccAgg._sum.sessions ?? 0,
      commits: ccAgg._sum.commits ?? 0,
      pullRequests: ccAgg._sum.pullRequests ?? 0,
      linesAdded: ccAgg._sum.linesAdded ?? 0,
      estimatedCost: Number(ccAgg._sum.estimatedCostUsd ?? 0),
    },
    topUsers: await (async () => {
      // Enrich with user id + name from local User table via email
      const emails = topUsers.map(u => u.userEmail);
      const userRecords = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { id: true, email: true, name: true },
      });
      const userMap = Object.fromEntries(userRecords.map(u => [u.email, u]));
      // Also get team for each user
      const memberTeams = await prisma.teamMember.findMany({
        where: { user: { email: { in: emails } } },
        select: { user: { select: { email: true } }, team: { select: { name: true } } },
      });
      const teamMap = Object.fromEntries(memberTeams.map(m => [m.user.email, m.team.name]));
      return topUsers.map(u => ({
        id:    userMap[u.userEmail]?.id    ?? null,
        name:  userMap[u.userEmail]?.name  ?? u.userEmail,
        email: u.userEmail,
        team:  teamMap[u.userEmail]        ?? null,
        cost:  Number(u._sum.totalCostUsd ?? 0),
        tokens: u._sum.totalTokens ?? 0,
      }));
    })(),
    topTeams: topTeams.map(t => ({
      teamId: t.teamId,
      name: teamNameMap[t.teamId ?? ""] ?? "Unknown",
      cost: Number(t._sum.totalCostUsd ?? 0),
      tokens: t._sum.totalTokens ?? 0,
    })),
    provider: {
      status: providerConn?.status ?? "not_connected",
      lastSyncAt: providerConn?.lastSyncAt ?? null,
    },
    recentAlerts: recentAlerts.map(a => ({
      id: a.id,
      message: a.message,
      severity: a.severity,
      ruleName: a.alertRule.name,
      createdAt: a.createdAt,
      resolvedAt: a.resolvedAt,
    })),
  });
}
