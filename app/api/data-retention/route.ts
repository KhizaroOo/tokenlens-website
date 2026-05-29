import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policy = await prisma.dataRetentionPolicy.findUnique({
    where: { organizationId: session.organizationId },
  });

  return NextResponse.json({
    policy: policy ?? { retentionDays: 90, auditLogDays: 365, lastCleanupAt: null },
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { retentionDays, auditLogDays } = body as { retentionDays?: number; auditLogDays?: number };

  const validRetention = [30, 90, 180, 365];
  if (retentionDays && !validRetention.includes(retentionDays)) {
    return NextResponse.json({ error: "Invalid retention period" }, { status: 400 });
  }

  const policy = await prisma.dataRetentionPolicy.upsert({
    where: { organizationId: session.organizationId },
    update: {
      ...(retentionDays ? { retentionDays } : {}),
      ...(auditLogDays ? { auditLogDays } : {}),
    },
    create: {
      organizationId: session.organizationId,
      retentionDays: retentionDays ?? 90,
      auditLogDays: auditLogDays ?? 365,
    },
  });

  return NextResponse.json({ policy });
}
