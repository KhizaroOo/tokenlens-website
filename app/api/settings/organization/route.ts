import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  website: z.string().url().optional().nullable(),
  timezone: z.string().max(50).optional(),
  dataMode: z.enum(["demo", "live"]).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.organization.update({
    where: { id: session.organizationId },
    data: parsed.data as any,
  });

  return NextResponse.json({ ok: true, organization: { name: updated.name } });
}
