import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { syncClaudeCodeAnalytics } from "@/workers/sync-claude-code.worker";
import { checkAlerts } from "@/workers/alert-checker.worker";

export async function POST() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await syncClaudeCodeAnalytics(session.organizationId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Check alerts after sync
  await checkAlerts(session.organizationId).catch(() => null);

  return NextResponse.json({ ok: true, synced: result.synced });
}
