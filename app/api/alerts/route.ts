import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;

  const [rules, alerts] = await Promise.all([
    prisma.alertRule.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
    prisma.alert.findMany({
      where: { organizationId },
      include: { alertRule: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({ rules, alerts });
}
