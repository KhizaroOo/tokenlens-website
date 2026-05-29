import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskKey } from "@/lib/query-helpers";
import { decrypt } from "@/lib/encryption";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;

  const [org, budget, conn, alertRules] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId } }),
    prisma.budget.findFirst({
      where: { organizationId, teamId: null, period: "monthly" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.providerConnection.findUnique({
      where: { organizationId_provider: { organizationId, provider: "anthropic" } },
    }),
    prisma.alertRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Derive masked key - decrypt just to get last 4 chars, then re-mask
  let maskedKey: string | null = null;
  if (conn?.encryptedApiKey) {
    try {
      const raw = decrypt(conn.encryptedApiKey);
      maskedKey = maskKey(raw);
    } catch {
      maskedKey = "sk-ant-admin...????";
    }
  }

  return NextResponse.json({
    organization: {
      id: org?.id,
      name: org?.name ?? "",
      slug: org?.slug ?? "",
      website: (org as any)?.website ?? null,
      timezone: (org as any)?.timezone ?? "UTC",
      dataMode: (org as any)?.dataMode ?? "demo",
    },
    budget: {
      id: budget?.id ?? null,
      monthlyLimitUsd: budget ? Number(budget.limitUsd) : null,
    },
    provider: {
      status: conn?.status ?? "not_connected",
      hasApiKey: !!conn?.encryptedApiKey,
      maskedKey,
      lastSyncAt: conn?.lastSyncAt ?? null,
      lastSyncError: conn?.lastSyncError ?? null,
      lastUsageSyncedAt: (conn as any)?.lastUsageSyncedAt ?? null,
      lastClaudeCodeSyncedAt: (conn as any)?.lastClaudeCodeSyncedAt ?? null,
    },
    alertRules: alertRules.map(r => ({
      id: r.id,
      name: r.name,
      metric: r.metric,
      threshold: Number(r.threshold),
      operator: r.operator,
      period: r.period,
      enabled: r.enabled,
    })),
  });
}
