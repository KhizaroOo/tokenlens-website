import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const orgId = session.organizationId;

  const recs = await prisma.recommendation.findMany({
    where: {
      organizationId: orgId,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json({ recommendations: recs });
}
