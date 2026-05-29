import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";
import { z } from "zod";

// ── GET /api/teams ─────────────────────────────────────────────────────────────
export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  const teams = await prisma.team.findMany({
    where: { organizationId },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "asc" },
  });

  const [anthropicUsage, aiUsage, devAiUsage] = await Promise.all([
    prisma.usageDaily.groupBy({
      by: ["teamId"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    prisma.aiUsageDaily.groupBy({
      by: ["teamId"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { totalCostUsd: true, totalTokens: true },
    }),
    prisma.developerAiDaily.groupBy({
      by: ["teamId"],
      where: { organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { sessions: true, totalCostUsd: true },
    }),
  ]);

  // Merge all costs by teamId
  const costMap: Record<string, number> = {};
  const tokenMap: Record<string, number> = {};
  const sessionMap: Record<string, number> = {};

  for (const r of anthropicUsage) {
    const id = r.teamId ?? "";
    costMap[id]  = (costMap[id]  ?? 0) + Number(r._sum.totalCostUsd ?? 0);
    tokenMap[id] = (tokenMap[id] ?? 0) + Number(r._sum.totalTokens  ?? 0);
  }
  for (const r of aiUsage) {
    const id = r.teamId ?? "";
    costMap[id]  = (costMap[id]  ?? 0) + Number(r._sum.totalCostUsd ?? 0);
    tokenMap[id] = (tokenMap[id] ?? 0) + Number(r._sum.totalTokens  ?? 0);
  }
  for (const r of devAiUsage) {
    const id = r.teamId ?? "";
    costMap[id]    = (costMap[id]    ?? 0) + Number(r._sum.totalCostUsd ?? 0);
    sessionMap[id] = (sessionMap[id] ?? 0) + Number(r._sum.sessions    ?? 0);
  }

  return NextResponse.json({
    teams: teams.map((t) => ({
      id:           t.id,
      name:         t.name,
      slug:         t.slug,
      memberCount:  t._count.members,
      totalCostUsd: costMap[t.id]   ?? 0,
      totalTokens:  tokenMap[t.id]  ?? 0,
      devSessions:  sessionMap[t.id] ?? 0,
    })),
  });
}

// ── POST /api/teams ────────────────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(1).max(80).trim(),
});

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const { name } = parsed.data;
  const { organizationId } = session;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Ensure slug is unique within the org
  const existing = await prisma.team.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
  });
  if (existing) return NextResponse.json({ error: "A team with that name already exists" }, { status: 409 });

  const team = await prisma.team.create({
    data: { organizationId, name, slug },
  });

  return NextResponse.json({ team }, { status: 201 });
}
