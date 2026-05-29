import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  // Phase 1: Anthropic models from modelUsageDaily
  const [anthropicModels, anthropicDaily, aiModels, aiDaily] = await Promise.all([
    prisma.modelUsageDaily.groupBy({
      by: ["model"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.modelUsageDaily.groupBy({
      by: ["model", "date"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalTokens: true, totalCostUsd: true },
      orderBy: { date: "asc" },
    }),
    // Phase 2: Other providers from aiModelUsageDaily
    prisma.aiModelUsageDaily.groupBy({
      by: ["model", "provider"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.aiModelUsageDaily.groupBy({
      by: ["model", "provider", "date"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalTokens: true, totalCostUsd: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const PROVIDER_LABELS: Record<string, string> = { anthropic: "Claude", openai: "OpenAI" };

  // Merge all models into unified list
  const allModels = [
    ...anthropicModels.map(m => ({
      model:        m.model,
      provider:     "anthropic",
      providerLabel: "Claude",
      _sum: {
        totalCostUsd: Number(m._sum.totalCostUsd ?? 0),
        totalTokens:  Number(m._sum.totalTokens  ?? 0),
        inputTokens:  Number(m._sum.inputTokens  ?? 0),
        outputTokens: Number(m._sum.outputTokens ?? 0),
      },
    })),
    ...aiModels.map(m => ({
      model:        m.model,
      provider:     m.provider,
      providerLabel: PROVIDER_LABELS[m.provider] ?? m.provider,
      _sum: {
        totalCostUsd: Number(m._sum.totalCostUsd ?? 0),
        totalTokens:  Number(m._sum.totalTokens  ?? 0),
        inputTokens:  Number(m._sum.inputTokens  ?? 0),
        outputTokens: Number(m._sum.outputTokens ?? 0),
      },
    })),
  ].sort((a, b) => b._sum.totalCostUsd - a._sum.totalCostUsd);

  // Flat daily rows — combine anthropic + ai providers
  const daily = [
    ...anthropicDaily.map(d => ({
      model:        d.model,
      provider:     "anthropic",
      date:         d.date.toISOString().split("T")[0],
      totalTokens:  Number(d._sum.totalTokens  ?? 0),
      totalCostUsd: Number(d._sum.totalCostUsd ?? 0),
    })),
    ...aiDaily.map(d => ({
      model:        d.model,
      provider:     d.provider,
      date:         d.date.toISOString().split("T")[0],
      totalTokens:  Number(d._sum.totalTokens  ?? 0),
      totalCostUsd: Number(d._sum.totalCostUsd ?? 0),
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ models: allModels, daily });
}
