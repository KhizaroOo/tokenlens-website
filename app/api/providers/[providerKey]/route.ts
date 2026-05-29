/**
 * Generic provider connection management.
 * GET    /api/providers/[providerKey]   — connection status
 * POST   /api/providers/[providerKey]   — connect (save credential)
 * DELETE /api/providers/[providerKey]   — disconnect
 */

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";
import { PROVIDER_MAP } from "@/modules/providers/registry";

// Test-connection helpers — imported lazily to keep bundle small
import { testOpenAIConnection } from "@/modules/providers/openai/connector";
import { testGitHubConnection, parseGitHubCredential } from "@/modules/providers/github_copilot/connector";
import { testCursorConnection } from "@/modules/providers/cursor/connector";
import { testMicrosoftConnection, parseMicrosoftCredential } from "@/modules/providers/microsoft_copilot/connector";

const SUPPORTED = new Set(["openai", "github_copilot", "cursor", "microsoft_copilot"]);

const connectSchema = z.object({ credential: z.string().min(1) });

type Ctx = { params: Promise<{ providerKey: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { providerKey } = await params;
  const conn = await prisma.providerConnection.findUnique({
    where: {
      organizationId_provider: {
        organizationId: session.organizationId,
        provider: providerKey,
      },
    },
    select: { status: true, lastSyncAt: true, lastSyncError: true },
  });

  return NextResponse.json({
    provider:    providerKey,
    status:      conn?.status ?? "not_connected",
    lastSyncAt:  conn?.lastSyncAt ?? null,
    lastSyncError: conn?.lastSyncError ?? null,
  });
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { providerKey } = await params;
  if (!SUPPORTED.has(providerKey)) {
    return NextResponse.json({ error: `Provider '${providerKey}' not supported for direct connection` }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "credential required" }, { status: 400 });

  const { credential } = parsed.data;
  const { organizationId } = session;

  // Validate credential against the real provider API before saving
  let testResult: { ok: boolean; error?: string };
  try {
    switch (providerKey) {
      case "openai":
        testResult = await testOpenAIConnection(credential);
        break;
      case "github_copilot":
        testResult = await testGitHubConnection(parseGitHubCredential(credential));
        break;
      case "cursor":
        testResult = await testCursorConnection(credential);
        break;
      case "microsoft_copilot":
        testResult = await testMicrosoftConnection(parseMicrosoftCredential(credential));
        break;
      default:
        testResult = { ok: false, error: "Unsupported provider" };
    }
  } catch (err) {
    testResult = { ok: false, error: err instanceof Error ? err.message : "Connection test failed" };
  }

  if (!testResult.ok) {
    return NextResponse.json(
      { error: testResult.error ?? "Connection test failed" },
      { status: 422 }
    );
  }

  const encryptedApiKey = encrypt(credential);

  await prisma.providerConnection.upsert({
    where: { organizationId_provider: { organizationId, provider: providerKey } },
    create: { organizationId, provider: providerKey, encryptedApiKey, status: "connected" },
    update: { encryptedApiKey, status: "connected", lastSyncError: null },
  });

  const provDef = PROVIDER_MAP[providerKey as keyof typeof PROVIDER_MAP];
  return NextResponse.json({
    provider: providerKey,
    status:   "connected",
    label:    provDef?.displayName ?? providerKey,
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { providerKey } = await params;
  const { organizationId } = session;

  await prisma.providerConnection.updateMany({
    where: { organizationId, provider: providerKey },
    data:  { status: "not_connected", encryptedApiKey: null, lastSyncError: null },
  });

  return NextResponse.json({ provider: providerKey, status: "not_connected" });
}
