import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ── GET /api/teams/[teamId]/members ────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const { organizationId } = session;

  const team = await prisma.team.findFirst({ where: { id: teamId, organizationId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({
    members: members.map((m) => ({
      userId:   m.user.id,
      name:     m.user.name,
      email:    m.user.email,
      joinedAt: m.joinedAt,
    })),
  });
}

// ── POST /api/teams/[teamId]/members  (assign user) ───────────────────────────
const addSchema = z.object({ userId: z.string().min(1) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;
  const { organizationId } = session;

  const team = await prisma.team.findFirst({ where: { id: teamId, organizationId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { userId } = parsed.data;

  // Confirm user belongs to this org
  const member = await prisma.organizationMember.findFirst({ where: { organizationId, userId } });
  if (!member) return NextResponse.json({ error: "User not in organization" }, { status: 404 });

  try {
    await prisma.teamMember.create({ data: { teamId, userId } });
  } catch {
    return NextResponse.json({ error: "User already in this team" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

// ── DELETE /api/teams/[teamId]/members  (remove user) ─────────────────────────
const removeSchema = z.object({ userId: z.string().min(1) });

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;
  const { organizationId } = session;

  const team = await prisma.team.findFirst({ where: { id: teamId, organizationId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await prisma.teamMember.deleteMany({ where: { teamId, userId: parsed.data.userId } });

  return NextResponse.json({ ok: true });
}
