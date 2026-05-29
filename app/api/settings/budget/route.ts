import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ monthlyLimitUsd: z.number().positive() });

export async function PATCH(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Upsert org-level monthly budget
  const existing = await prisma.budget.findFirst({
    where: { organizationId: session.organizationId, teamId: null, period: "monthly" },
  });

  if (existing) {
    await prisma.budget.update({
      where: { id: existing.id },
      data: { limitUsd: parsed.data.monthlyLimitUsd },
    });
  } else {
    await prisma.budget.create({
      data: {
        organizationId: session.organizationId,
        name: "Monthly Budget",
        limitUsd: parsed.data.monthlyLimitUsd,
        period: "monthly",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
