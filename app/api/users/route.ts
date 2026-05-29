import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  const [members, anthropicUsage, aiUsage, devAiUsage] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          include: {
            teamMembers: {
              where: { team: { organizationId } },
              include: { team: true },
            },
          },
        },
      },
    }),
    // Phase 1: Anthropic usage
    prisma.usageDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    // Phase 2: Other API spend providers
    prisma.aiUsageDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    // Phase 2: Developer AI
    prisma.developerAiDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { sessions: true, suggestions: true, acceptances: true, totalCostUsd: true },
    }),
  ]);

  // Merge all usage by email
  const costMap: Record<string, number> = {};
  const tokenMap: Record<string, number> = {};
  const devMap: Record<string, { sessions: number; suggestions: number; acceptances: number; devCost: number }> = {};

  for (const r of anthropicUsage) {
    costMap[r.userEmail]  = (costMap[r.userEmail]  ?? 0) + Number(r._sum.totalCostUsd ?? 0);
    tokenMap[r.userEmail] = (tokenMap[r.userEmail] ?? 0) + Number(r._sum.totalTokens  ?? 0);
  }
  for (const r of aiUsage) {
    costMap[r.userEmail]  = (costMap[r.userEmail]  ?? 0) + Number(r._sum.totalCostUsd ?? 0);
    tokenMap[r.userEmail] = (tokenMap[r.userEmail] ?? 0) + Number(r._sum.totalTokens  ?? 0);
  }
  for (const r of devAiUsage) {
    const e = r.userEmail;
    devMap[e] = {
      sessions:    (devMap[e]?.sessions    ?? 0) + Number(r._sum.sessions    ?? 0),
      suggestions: (devMap[e]?.suggestions ?? 0) + Number(r._sum.suggestions ?? 0),
      acceptances: (devMap[e]?.acceptances ?? 0) + Number(r._sum.acceptances ?? 0),
      devCost:     (devMap[e]?.devCost     ?? 0) + Number(r._sum.totalCostUsd ?? 0),
    };
  }

  const users = members.map((m) => {
    const email = m.user.email;
    const team = m.user.teamMembers[0]?.team;
    const dev  = devMap[email];
    return {
      id:           m.user.id,
      name:         m.user.name,
      email,
      role:         m.role,
      team:         team?.name ?? null,
      teamId:       team?.id   ?? null,
      // Multi-provider totals
      totalCostUsd:  (costMap[email]  ?? 0) + (dev?.devCost ?? 0),
      totalTokens:   tokenMap[email]  ?? 0,
      apiCostUsd:    costMap[email]   ?? 0,
      devAiSessions: dev?.sessions    ?? 0,
      suggestions:   dev?.suggestions ?? 0,
      acceptances:   dev?.acceptances ?? 0,
    };
  });

  return NextResponse.json({ users });
}
