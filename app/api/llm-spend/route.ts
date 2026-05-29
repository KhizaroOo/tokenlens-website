import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

/**
 * GET /api/llm-spend?days=30
 * Returns aggregated data for integrated API Spend providers: anthropic, openai
 */
export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const since = startOfDay(subDays(new Date(), days));

  // Phase 1: Anthropic from usageDaily
  const [anthropicByUser, anthropicByModel, anthropicTrend] = await Promise.all([
    prisma.usageDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, provider: "anthropic", date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.modelUsageDaily.groupBy({
      by: ["model"],
      where: { organizationId, provider: "anthropic", date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.usageDaily.groupBy({
      by: ["date"],
      where: { organizationId, provider: "anthropic", date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Phase 2: OpenAI from aiUsageDaily (gemini/perplexity excluded — no admin API)
  const [aiByProvider, aiByUser, aiTrend] = await Promise.all([
    prisma.aiUsageDaily.groupBy({
      by: ["provider"],
      where: { organizationId, provider: "openai", date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
    }),
    prisma.aiUsageDaily.groupBy({
      by: ["provider", "userEmail"],
      where: { organizationId, provider: "openai", date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.aiUsageDaily.groupBy({
      by: ["provider", "date"],
      where: { organizationId, provider: "openai", date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Build provider totals (anthropic + ai providers merged)
  const providerTotals: Record<string, { totalCostUsd: number; totalTokens: number; inputTokens: number; outputTokens: number }> = {
    anthropic: {
      totalCostUsd: anthropicByUser.reduce((s, r) => s + Number(r._sum.totalCostUsd ?? 0), 0),
      totalTokens:  anthropicByUser.reduce((s, r) => s + Number(r._sum.totalTokens  ?? 0), 0),
      inputTokens:  anthropicByUser.reduce((s, r) => s + Number(r._sum.inputTokens  ?? 0), 0),
      outputTokens: anthropicByUser.reduce((s, r) => s + Number(r._sum.outputTokens ?? 0), 0),
    },
  };
  for (const row of aiByProvider) {
    providerTotals[row.provider] = {
      totalCostUsd: Number(row._sum.totalCostUsd ?? 0),
      totalTokens:  Number(row._sum.totalTokens  ?? 0),
      inputTokens:  Number(row._sum.inputTokens  ?? 0),
      outputTokens: Number(row._sum.outputTokens ?? 0),
    };
  }

  // Combine trend data into [{date, anthropic, openai}]
  const trendMap = new Map<string, Record<string, number>>();
  for (const row of anthropicTrend) {
    const d = row.date.toISOString().split("T")[0];
    if (!trendMap.has(d)) trendMap.set(d, { date: d as unknown as number });
    trendMap.get(d)!["anthropic"] = Number(row._sum.totalCostUsd ?? 0);
  }
  for (const row of aiTrend) {
    const d = row.date.toISOString().split("T")[0];
    if (!trendMap.has(d)) trendMap.set(d, { date: d as unknown as number });
    trendMap.get(d)![row.provider] = Number(row._sum.totalCostUsd ?? 0);
  }
  const trend = Array.from(trendMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);

  // Top users across all providers
  const topUsers = [
    ...anthropicByUser.map((r) => ({ provider: "anthropic", userEmail: r.userEmail, totalCostUsd: Number(r._sum.totalCostUsd ?? 0), totalTokens: Number(r._sum.totalTokens ?? 0) })),
    ...aiByUser.map((r) => ({ provider: r.provider, userEmail: r.userEmail, totalCostUsd: Number(r._sum.totalCostUsd ?? 0), totalTokens: Number(r._sum.totalTokens ?? 0) })),
  ].sort((a, b) => b.totalCostUsd - a.totalCostUsd).slice(0, 20);

  // Models breakdown (anthropic only for now)
  const models = anthropicByModel.map((m) => ({
    provider: "anthropic",
    model: m.model,
    totalCostUsd:  Number(m._sum.totalCostUsd  ?? 0),
    totalTokens:   Number(m._sum.totalTokens   ?? 0),
    inputTokens:   Number(m._sum.inputTokens   ?? 0),
    outputTokens:  Number(m._sum.outputTokens  ?? 0),
  }));

  return NextResponse.json({ providerTotals, trend, topUsers, models });
}
