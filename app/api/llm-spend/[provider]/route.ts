import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

/**
 * GET /api/llm-spend/[provider]?days=30
 * provider: claude | openai | gemini | perplexity
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

  // claude → anthropic in DB
  const dbProvider = providerSlug === "claude" ? "anthropic" : providerSlug;
  const validProviders = ["anthropic", "openai"];
  if (!validProviders.includes(dbProvider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  if (dbProvider === "anthropic") {
    // Phase 1 tables
    const [totals, byUser, trend, byModel] = await Promise.all([
      prisma.usageDaily.aggregate({
        where: { organizationId, provider: "anthropic", date: { gte: since } },
        _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true, cachedTokens: true },
      }),
      prisma.usageDaily.groupBy({
        by: ["userEmail"],
        where: { organizationId, provider: "anthropic", date: { gte: since } },
        _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
        orderBy: { _sum: { totalCostUsd: "desc" } },
      }),
      prisma.usageDaily.groupBy({
        by: ["date"],
        where: { organizationId, provider: "anthropic", date: { gte: since } },
        _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
        orderBy: { date: "asc" },
      }),
      prisma.modelUsageDaily.groupBy({
        by: ["model"],
        where: { organizationId, provider: "anthropic", date: { gte: since } },
        _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
        orderBy: { _sum: { totalCostUsd: "desc" } },
      }),
    ]);

    return NextResponse.json({
      provider: "anthropic",
      label: "Claude (Anthropic)",
      totals: {
        totalCostUsd:  Number(totals._sum.totalCostUsd  ?? 0),
        totalTokens:   Number(totals._sum.totalTokens   ?? 0),
        inputTokens:   Number(totals._sum.inputTokens   ?? 0),
        outputTokens:  Number(totals._sum.outputTokens  ?? 0),
        cachedTokens:  Number(totals._sum.cachedTokens  ?? 0),
      },
      byUser: byUser.map(r => ({
        userEmail:    r.userEmail,
        totalCostUsd: Number(r._sum.totalCostUsd  ?? 0),
        totalTokens:  Number(r._sum.totalTokens   ?? 0),
        inputTokens:  Number(r._sum.inputTokens   ?? 0),
        outputTokens: Number(r._sum.outputTokens  ?? 0),
      })),
      trend: trend.map(r => ({
        date:         r.date.toISOString().split("T")[0],
        totalCostUsd: Number(r._sum.totalCostUsd  ?? 0),
        totalTokens:  Number(r._sum.totalTokens   ?? 0),
        inputTokens:  Number(r._sum.inputTokens   ?? 0),
        outputTokens: Number(r._sum.outputTokens  ?? 0),
      })),
      byModel: byModel.map(m => ({
        model:        m.model,
        totalCostUsd: Number(m._sum.totalCostUsd  ?? 0),
        totalTokens:  Number(m._sum.totalTokens   ?? 0),
        inputTokens:  Number(m._sum.inputTokens   ?? 0),
        outputTokens: Number(m._sum.outputTokens  ?? 0),
      })),
    });
  }

  // Phase 2 providers (openai, gemini, perplexity) — from aiUsageDaily / aiModelUsageDaily
  const [totals, byUser, trend, byModel] = await Promise.all([
    prisma.aiUsageDaily.aggregate({
      where: { organizationId, provider: dbProvider, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
    }),
    prisma.aiUsageDaily.groupBy({
      by: ["userEmail"],
      where: { organizationId, provider: dbProvider, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
    prisma.aiUsageDaily.groupBy({
      by: ["date"],
      where: { organizationId, provider: dbProvider, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { date: "asc" },
    }),
    prisma.aiModelUsageDaily.groupBy({
      by: ["model"],
      where: { organizationId, provider: dbProvider, date: { gte: since } },
      _sum: { totalCostUsd: true, totalTokens: true, inputTokens: true, outputTokens: true },
      orderBy: { _sum: { totalCostUsd: "desc" } },
    }),
  ]);

  const LABELS: Record<string, string> = { openai: "OpenAI", gemini: "Google Gemini", perplexity: "Perplexity" };

  return NextResponse.json({
    provider: dbProvider,
    label: LABELS[dbProvider] ?? dbProvider,
    totals: {
      totalCostUsd:  Number(totals._sum.totalCostUsd  ?? 0),
      totalTokens:   Number(totals._sum.totalTokens   ?? 0),
      inputTokens:   Number(totals._sum.inputTokens   ?? 0),
      outputTokens:  Number(totals._sum.outputTokens  ?? 0),
      cachedTokens:  0,
    },
    byUser: byUser.map(r => ({
      userEmail:    r.userEmail,
      totalCostUsd: Number(r._sum.totalCostUsd  ?? 0),
      totalTokens:  Number(r._sum.totalTokens   ?? 0),
      inputTokens:  Number(r._sum.inputTokens   ?? 0),
      outputTokens: Number(r._sum.outputTokens  ?? 0),
    })),
    trend: trend.map(r => ({
      date:         r.date.toISOString().split("T")[0],
      totalCostUsd: Number(r._sum.totalCostUsd  ?? 0),
      totalTokens:  Number(r._sum.totalTokens   ?? 0),
    })),
    byModel: byModel.map(m => ({
      model:        m.model,
      totalCostUsd: Number(m._sum.totalCostUsd  ?? 0),
      totalTokens:  Number(m._sum.totalTokens   ?? 0),
      inputTokens:  Number(m._sum.inputTokens   ?? 0),
      outputTokens: Number(m._sum.outputTokens  ?? 0),
    })),
  });
}
