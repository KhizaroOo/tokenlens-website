import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Enrich with the user's display name from the DB
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });

  return NextResponse.json({
    user: {
      userId: session.userId,
      email: session.email,
      organizationId: session.organizationId,
      role: session.role,
      name: user?.name ?? session.email,
    },
  });
}
