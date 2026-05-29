import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { channelId } = body as { channelId: string };

  const channel = await prisma.notificationChannel.findFirst({
    where: { id: channelId, organizationId: session.organizationId },
  });
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  // Log a test delivery (no real send in demo mode)
  await prisma.notificationDeliveryLog.create({
    data: {
      organizationId: session.organizationId,
      notificationChannelId: channelId,
      subject: `[Test] TokenLens notification test — ${channel.name}`,
      status: "sent",
    },
  });

  return NextResponse.json({ success: true, message: `Test notification logged for channel: ${channel.name}` });
}
