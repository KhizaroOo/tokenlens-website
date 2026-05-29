import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["cost", "tokens", "claude-code", "developer-ai", "business-ai", "provider-comparison", "seat-utilization", "executive-summary"]),
  days: z.coerce.number().int().min(1).max(365).default(30),
  provider: z.string().optional(),
  category: z.string().optional(),
});

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
    ),
  ];
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const parsed = schema.safeParse({
    type: searchParams.get("type"),
    days: searchParams.get("days"),
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid params" }, { status: 400 });

  const { type, days, provider, category } = parsed.data;
  const { organizationId } = session;
  const since = startOfDay(subDays(new Date(), days));

  let csv = "";
  let filename = "";

  if (type === "cost") {
    const rows = await prisma.usageDaily.findMany({
      where: { organizationId, date: { gte: since } },
      orderBy: { date: "desc" },
      select: { date: true, userEmail: true, inputTokens: true, outputTokens: true, cachedTokens: true, totalTokens: true, totalCostUsd: true },
    });
    csv = toCSV(rows.map((r) => ({ ...r, date: r.date.toISOString().split("T")[0], totalCostUsd: Number(r.totalCostUsd) })));
    filename = `tokenlens-cost-${days}d.csv`;
  } else if (type === "tokens") {
    const rows = await prisma.modelUsageDaily.findMany({
      where: { organizationId, date: { gte: since } },
      orderBy: { date: "desc" },
      select: { date: true, model: true, inputTokens: true, outputTokens: true, totalTokens: true, totalCostUsd: true },
    });
    csv = toCSV(rows.map((r) => ({ ...r, date: r.date.toISOString().split("T")[0], totalCostUsd: Number(r.totalCostUsd) })));
    filename = `tokenlens-tokens-${days}d.csv`;
  } else if (type === "claude-code") {
    const rows = await prisma.claudeCodeDaily.findMany({
      where: { organizationId, date: { gte: since } },
      orderBy: { date: "desc" },
      select: { date: true, userEmail: true, sessions: true, commits: true, pullRequests: true, linesAdded: true, linesRemoved: true, estimatedCostUsd: true },
    });
    csv = toCSV(rows.map((r) => ({ ...r, date: r.date.toISOString().split("T")[0], estimatedCostUsd: Number(r.estimatedCostUsd) })));
    filename = `tokenlens-claude-code-${days}d.csv`;
  } else if (type === "developer-ai") {
    const where: Record<string, unknown> = { organizationId, date: { gte: since } };
    if (provider) where.provider = provider;
    const rows = await prisma.developerAiDaily.findMany({
      where,
      orderBy: { date: "desc" },
      select: { date: true, provider: true, userEmail: true, sessions: true, totalCostUsd: true },
    });
    csv = toCSV(rows.map(r => ({ ...r, date: r.date.toISOString().split("T")[0], totalCostUsd: Number(r.totalCostUsd) })));
    filename = `tokenlens-developer-ai-${days}d.csv`;
  } else if (type === "business-ai") {
    const rows = await prisma.businessAiDaily.findMany({
      where: { organizationId, date: { gte: since } },
      orderBy: { date: "desc" },
      select: { date: true, provider: true, app: true, activeUsers: true, totalSessions: true, totalCostUsd: true },
    });
    csv = toCSV(rows.map(r => ({ ...r, date: r.date.toISOString().split("T")[0], totalCostUsd: Number(r.totalCostUsd) })));
    filename = `tokenlens-business-ai-${days}d.csv`;
  } else if (type === "provider-comparison") {
    const [apiSpend, devAi] = await Promise.all([
      prisma.aiUsageDaily.groupBy({
        by: ["provider"],
        where: { organizationId, date: { gte: since } },
        _sum: { totalCostUsd: true, totalTokens: true },
      }),
      prisma.developerAiDaily.groupBy({
        by: ["provider"],
        where: { organizationId, date: { gte: since } },
        _sum: { totalCostUsd: true, sessions: true },
      }),
    ]);
    const rows = [
      ...apiSpend.map(r => ({ provider: r.provider, category: "api_spend", totalCostUsd: Number(r._sum.totalCostUsd ?? 0), totalTokens: Number(r._sum.totalTokens ?? 0), sessions: 0 })),
      ...devAi.map(r => ({ provider: r.provider, category: "developer_ai", totalCostUsd: Number(r._sum.totalCostUsd ?? 0), totalTokens: 0, sessions: Number(r._sum.sessions ?? 0) })),
    ];
    csv = toCSV(rows);
    filename = `tokenlens-provider-comparison-${days}d.csv`;
  } else if (type === "seat-utilization") {
    const rows = await prisma.seatUsageDaily.findMany({
      where: { organizationId, date: { gte: since } },
      orderBy: { date: "desc" },
      select: { date: true, provider: true, totalSeats: true, activeSeats: true, totalCostUsd: true, costPerSeat: true },
    });
    csv = toCSV(rows.map(r => ({
      ...r,
      date: r.date.toISOString().split("T")[0],
      inactive_seats: r.totalSeats - r.activeSeats,
      utilization_pct: r.totalSeats > 0 ? ((r.activeSeats / r.totalSeats) * 100).toFixed(1) : "0",
      totalCostUsd: Number(r.totalCostUsd),
      costPerSeat: Number(r.costPerSeat),
    })));
    filename = `tokenlens-seat-utilization-${days}d.csv`;
  } else {
    // executive-summary: aggregate across all sources
    const [usage, devAi, seats] = await Promise.all([
      prisma.usageDaily.aggregate({
        where: { organizationId, date: { gte: since } },
        _sum: { totalCostUsd: true, totalTokens: true },
      }),
      prisma.developerAiDaily.aggregate({
        where: { organizationId, date: { gte: since } },
        _sum: { totalCostUsd: true, sessions: true },
      }),
      prisma.seatUsageDaily.aggregate({
        where: { organizationId, date: { gte: since } },
        _sum: { totalSeats: true, activeSeats: true },
      }),
    ]);
    const totalSeats  = Number(seats._sum.totalSeats ?? 0);
    const activeSeats = Number(seats._sum.activeSeats ?? 0);
    csv = toCSV([{
      period_days: days,
      anthropic_cost_usd: Number(usage._sum.totalCostUsd ?? 0),
      total_tokens: Number(usage._sum.totalTokens ?? 0),
      developer_ai_cost_usd: Number(devAi._sum.totalCostUsd ?? 0),
      developer_sessions: Number(devAi._sum.sessions ?? 0),
      avg_seat_utilization_pct: totalSeats > 0 ? ((activeSeats / totalSeats) * 100).toFixed(1) : "0",
    }]);
    filename = `tokenlens-executive-summary-${days}d.csv`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
