import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { z } from "zod";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await prisma.providerConnection.findUnique({
    where: { organizationId_provider: { organizationId: session.organizationId, provider: "anthropic" } },
  });

  return NextResponse.json({
    status: conn?.status ?? "not_connected",
    lastSyncAt: conn?.lastSyncAt ?? null,
    lastSyncError: conn?.lastSyncError ?? null,
    hasApiKey: !!conn?.encryptedApiKey,
  });
}

const schema = z.object({ apiKey: z.string().min(10) });

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid API key" }, { status: 400 });

  const encryptedApiKey = encrypt(parsed.data.apiKey);

  await prisma.providerConnection.upsert({
    where: { organizationId_provider: { organizationId: session.organizationId, provider: "anthropic" } },
    create: {
      organizationId: session.organizationId,
      provider: "anthropic",
      encryptedApiKey,
      status: "connected",
    },
    update: { encryptedApiKey, status: "connected", lastSyncError: null },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.providerConnection.update({
    where: { organizationId_provider: { organizationId: session.organizationId, provider: "anthropic" } },
    data: { encryptedApiKey: null, status: "not_connected" },
  });

  return NextResponse.json({ ok: true });
}
