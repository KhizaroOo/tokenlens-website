/**
 * POST /api/providers/[providerKey]/sync
 * Trigger a manual data sync for any connected provider.
 */

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { syncOpenAI } from "@/workers/sync-openai.worker";
import { syncGitHubCopilot } from "@/workers/sync-github-copilot.worker";
import { syncCursor } from "@/workers/sync-cursor.worker";
import { syncMicrosoftCopilot } from "@/workers/sync-microsoft-copilot.worker";
import { syncClaudeUsage } from "@/workers/sync-claude-usage.worker";
import { syncClaudeCodeAnalytics } from "@/workers/sync-claude-code.worker";
import { checkAlerts } from "@/workers/alert-checker.worker";

type Ctx = { params: Promise<{ providerKey: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { providerKey } = await params;
  const { organizationId } = session;

  let result: { synced: number; errors?: string[]; error?: string; newUsers?: number };

  /**
   * SYNC BEHAVIOUR:
   * - anthropic / claude_code: always calls real Anthropic Admin API
   * - openai / github_copilot / cursor / microsoft_copilot:
   *     calls real provider API when credentials are stored in providerConnection table.
   *     If no credential is found, the worker returns { synced: 0, errors: ["X not connected"] }
   *     and demo/seed data remains unchanged.
   *     On first successful sync, the worker purges all demo rows for that provider
   *     and replaces them with live API data.
   * - gemini / perplexity: no admin API exists — sync is not supported.
   *     These providers are limited and route to /limitations.
   */
  if (providerKey === "gemini" || providerKey === "perplexity") {
    return NextResponse.json(
      { error: `${providerKey} has no admin API. Data cannot be synced programmatically. See /limitations for details.` },
      { status: 400 }
    );
  }

  switch (providerKey) {
    case "anthropic":
      result = await syncClaudeUsage(organizationId);
      break;
    case "claude_code":
      result = await syncClaudeCodeAnalytics(organizationId);
      break;
    case "openai":
      result = await syncOpenAI(organizationId);
      break;
    case "github_copilot":
      result = await syncGitHubCopilot(organizationId);
      break;
    case "cursor":
      result = await syncCursor(organizationId);
      break;
    case "microsoft_copilot":
      result = await syncMicrosoftCopilot(organizationId);
      break;
    default:
      return NextResponse.json({ error: `No sync implementation for '${providerKey}'` }, { status: 400 });
  }

  // Run alert checks after any successful sync
  if (!result.error) {
    await checkAlerts(organizationId).catch(() => {});
  }

  return NextResponse.json({ provider: providerKey, ...result });
}
