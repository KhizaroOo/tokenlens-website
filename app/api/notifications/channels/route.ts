import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channels = await prisma.notificationChannel.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "asc" },
  });

  const logs = await prisma.notificationDeliveryLog.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { sentAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ channels, recentDeliveries: logs });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, type, config } = body as { name: string; type: string; config: Record<string, string> };

  const validTypes = ["email", "slack", "teams"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid channel type" }, { status: 400 });
  }

  const channel = await prisma.notificationChannel.create({
    data: { organizationId: session.organizationId, name, type, config, enabled: true },
  });

  return NextResponse.json({ channel });
}
