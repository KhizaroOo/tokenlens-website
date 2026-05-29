import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { syncClaudeUsage } from "@/workers/sync-claude-usage.worker";
import { syncClaudeCodeAnalytics } from "@/workers/sync-claude-code.worker";
import { checkAlerts } from "@/workers/alert-checker.worker";

export async function POST() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;

  // Run both syncs sequentially — usage first, then Claude Code
  const usageResult = await syncClaudeUsage(organizationId);
  const codeResult  = await syncClaudeCodeAnalytics(organizationId);

  // Check alerts once after both syncs complete
  await checkAlerts(organizationId).catch(() => null);

  const errors: string[] = [];
  if (usageResult.error) errors.push(`Usage: ${usageResult.error}`);
  if (codeResult.error)  errors.push(`Claude Code: ${codeResult.error}`);

  if (errors.length === 2) {
    return NextResponse.json({ error: errors.join(" | ") }, { status: 400 });
  }

  return NextResponse.json({
    ok:               true,
    usageSynced:      usageResult.synced,
    claudeCodeSynced: codeResult.synced,
    newUsersCreated:  usageResult.newUsers ?? 0,
    errors:           errors.length ? errors : undefined,
  });
}
