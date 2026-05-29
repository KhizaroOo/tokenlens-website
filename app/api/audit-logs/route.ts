import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") ?? 30), 365);
  const action = searchParams.get("action") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 50;
  const orgId = session.organizationId;
  const since = subDays(new Date(), days);

  const where = {
    organizationId: orgId,
    createdAt: { gte: since },
    ...(action ? { action } : {}),
    ...(search ? { OR: [{ action: { contains: search, mode: "insensitive" as const } }, { resource: { contains: search, mode: "insensitive" as const } }] } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
