import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") ?? 30), 90);
  const orgId = session.organizationId;
  const since = subDays(new Date(), days);

  const [corrRows, adoptionRows] = await Promise.all([
    prisma.productivityCorrelationDaily.findMany({
      where: { organizationId: orgId, teamId: null, date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.aiAdoptionScoreDaily.findMany({
      where: { organizationId: orgId, entityType: "team", date: { gte: since } },
      orderBy: { date: "asc" },
    }),
  ]);

  const daily = corrRows.map(r => ({
    date: format(r.date, "MMM d"),
    aiSpend: Number(r.aiSpendUsd),
    prsMerged: r.prsMerged,
    ticketsResolved: r.ticketsResolved,
    costPerPr: r.costPerPr ? Number(r.costPerPr) : null,
    adoptionScore: r.adoptionScore ? Number(r.adoptionScore) : null,
  }));

  // Team-level adoption trend (most recent day)
  const latestDate = adoptionRows.length > 0 ? adoptionRows[adoptionRows.length - 1].date : null;
  const teamAdoption = latestDate
    ? adoptionRows
        .filter(r => format(r.date, "yyyy-MM-dd") === format(latestDate, "yyyy-MM-dd"))
        .map(r => ({ teamId: r.entityId, score: Number(r.score), badge: r.badge }))
    : [];

  return NextResponse.json({ daily, teamAdoption });
}
