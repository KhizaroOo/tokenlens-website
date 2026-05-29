import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status: string };

  const validStatuses = ["open", "accepted", "dismissed", "resolved"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const rec = await prisma.recommendation.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.recommendation.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === "resolved" ? new Date() : rec.resolvedAt,
    },
  });

  return NextResponse.json({ recommendation: updated });
}
