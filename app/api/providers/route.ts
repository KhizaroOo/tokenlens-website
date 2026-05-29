import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllProviders } from "@/modules/providers/registry";
import { isTokenBased, isSeatBased } from "@/modules/providers/capabilities";
import type { ProviderSummary } from "@/modules/providers/types";

/**
 * GET /api/providers
 * Returns summary card data for all providers: cost, tokens, seats, status.
 */
export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;

  // Fetch all provider connections
  const connections = await prisma.providerConnection.findMany({
    where: { organizationId },
  });
  const connByProvider = new Map(connections.map((c) => [c.provider, c]));

  // Aggregate Phase 1 Anthropic totals from usageDaily
  const anthropicUsage = await prisma.usageDaily.aggregate({
    where: { organizationId, provider: "anthropic" },
    _sum: { totalCostUsd: true, totalTokens: true },
    _count: { userEmail: true },
  });
  const anthropicUniqueUsers = await prisma.usageDaily.groupBy({
    by: ["userEmail"],
    where: { organizationId, provider: "anthropic" },
  });

  // Aggregate Phase 2 AiUsageDaily for non-anthropic providers
  const aiProviderTotals = await prisma.aiUsageDaily.groupBy({
    by: ["provider"],
    where: { organizationId },
    _sum: { totalCostUsd: true, totalTokens: true },
  });
  const aiUniqueUsers = await prisma.aiUsageDaily.groupBy({
    by: ["provider", "userEmail"],
    where: { organizationId },
  });

  // Aggregate seat usage for seat-based providers
  const seatTotals = await prisma.seatUsageDaily.groupBy({
    by: ["provider"],
    where: { organizationId },
    _sum: { totalCostUsd: true },
    _avg: { activeSeats: true, totalSeats: true },
  });
  const seatByProvider = new Map(seatTotals.map((s) => [s.provider, s]));

  // Build a provider → unique user count map
  const userCountByProvider: Record<string, number> = {
    anthropic: anthropicUniqueUsers.length,
  };
  for (const row of aiUniqueUsers) {
    if (!userCountByProvider[row.provider]) userCountByProvider[row.provider] = 0;
    userCountByProvider[row.provider]++;
  }

  const aiTotalsByProvider = new Map(aiProviderTotals.map((r) => [r.provider, r]));

  const allProviders = getAllProviders();
  const summaries: ProviderSummary[] = allProviders.map((def) => {
    const conn = connByProvider.get(def.key);
    let totalCostUsd = 0;
    let totalTokens = 0;
    let activeSeats = 0;

    if (def.key === "anthropic") {
      totalCostUsd = Number(anthropicUsage._sum.totalCostUsd ?? 0);
      totalTokens  = Number(anthropicUsage._sum.totalTokens  ?? 0);
    } else if (isTokenBased(def.key)) {
      const row = aiTotalsByProvider.get(def.key);
      totalCostUsd = Number(row?._sum.totalCostUsd ?? 0);
      totalTokens  = Number(row?._sum.totalTokens  ?? 0);
    } else if (isSeatBased(def.key)) {
      const row = seatByProvider.get(def.key);
      totalCostUsd = Number(row?._sum.totalCostUsd ?? 0);
      activeSeats  = Math.round(Number(row?._avg.activeSeats ?? 0));
    }

    const status: ProviderSummary["status"] =
      conn?.status === "connected" ? "connected" : "not_connected";

    return {
      provider:     def.key,
      label:        def.displayName,
      category:     def.category,
      color:        def.accentColor,
      totalCostUsd,
      totalTokens,
      activeUsers:  userCountByProvider[def.key] ?? 0,
      activeSeats,
      lastSyncAt:   conn?.lastSyncAt?.toISOString() ?? null,
      status,
    };
  });

  return NextResponse.json({ providers: summaries });
}
