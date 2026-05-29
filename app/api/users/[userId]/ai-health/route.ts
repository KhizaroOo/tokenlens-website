import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;
  const orgId = session.organizationId;
  const since = subDays(new Date(), 30);

  // Get user email first
  const member = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, userId },
    include: { user: true },
  });
  if (!member) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const email = member.user.email;

  const [adoptionScore, wasteScore, anthropicUsage, aiUsage, devAiUsage, seatMappings, recs] = await Promise.all([
    prisma.aiAdoptionScoreDaily.findFirst({
      where: { organizationId: orgId, entityType: "user", entityId: email, date: { gte: since } },
      orderBy: { date: "desc" },
    }),
    prisma.aiWasteScoreDaily.findFirst({
      where: { organizationId: orgId, entityType: "user", entityId: email, date: { gte: since } },
      orderBy: { date: "desc" },
    }),
    prisma.usageDaily.aggregate({
      where: { organizationId: orgId, userEmail: email, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    prisma.aiUsageDaily.groupBy({
      by: ["provider"],
      where: { organizationId: orgId, userEmail: email, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    prisma.developerAiDaily.groupBy({
      by: ["provider"],
      where: { organizationId: orgId, userEmail: email, date: { gte: since } },
      _sum: { sessions: true, totalCostUsd: true },
    }),
    prisma.providerUserMapping.findMany({
      where: { organizationId: orgId, userEmail: email },
      select: { provider: true },
    }),
    prisma.recommendation.findMany({
      where: { organizationId: orgId, status: "open", OR: [{ entityId: email }, { entityId: null }] },
      orderBy: [{ priority: "desc" }],
      take: 3,
      select: { id: true, title: true, priority: true },
    }),
  ]);

  const PROVIDER_LABELS: Record<string, { label: string; category: string }> = {
    anthropic:          { label: "Claude (Anthropic)",   category: "api_spend" },
    openai:             { label: "OpenAI",               category: "api_spend" },
    claude_code:        { label: "Claude Code",          category: "developer_ai" },
    github_copilot:     { label: "GitHub Copilot",       category: "developer_ai" },
    cursor:             { label: "Cursor",               category: "developer_ai" },
    microsoft_copilot:  { label: "Microsoft Copilot",   category: "business_ai" },
  };

  const providerBreakdown = [
    // Anthropic from Phase 1
    {
      provider: "anthropic",
      label: "Claude (Anthropic)",
      category: "api_spend",
      totalCostUsd: Number(anthropicUsage._sum.totalCostUsd ?? 0),
      totalTokens: Number(anthropicUsage._sum.totalTokens ?? 0),
      sessions: 0,
    },
    // Other API spend providers
    ...aiUsage.map(r => ({
      provider: r.provider,
      label: PROVIDER_LABELS[r.provider]?.label ?? r.provider,
      category: PROVIDER_LABELS[r.provider]?.category ?? "api_spend",
      totalCostUsd: Number(r._sum.totalCostUsd ?? 0),
      totalTokens: Number(r._sum.totalTokens ?? 0),
      sessions: 0,
    })),
    // Developer AI providers
    ...devAiUsage.map(r => ({
      provider: r.provider,
      label: PROVIDER_LABELS[r.provider]?.label ?? r.provider,
      category: "developer_ai",
      totalCostUsd: Number(r._sum.totalCostUsd ?? 0),
      totalTokens: 0,
      sessions: Number(r._sum.sessions ?? 0),
    })),
  ].filter(p => p.totalCostUsd > 0 || p.sessions > 0);

  // Inactive seat warning: has seat mappings but low dev AI activity
  const totalDevSessions = devAiUsage.reduce((s, r) => s + Number(r._sum.sessions ?? 0), 0);
  const hasSeatProviders = seatMappings.some(m => ["github_copilot", "cursor", "microsoft_copilot"].includes(m.provider));
  const inactiveSeatWarning = hasSeatProviders && totalDevSessions < 5;

  return NextResponse.json({
    adoptionScore: Number(adoptionScore?.score ?? 0),
    adoptionBadge: adoptionScore?.badge ?? "inactive",
    wasteScore: Number(wasteScore?.score ?? 0),
    inactiveSeatWarning,
    providerBreakdown,
    recommendations: recs,
  });
}
