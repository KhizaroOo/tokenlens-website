import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { subDays, startOfDay, eachDayOfInterval, getDay } from "date-fns";
import { startSyncRun, completeSyncRun, failSyncRun } from "./sync-run-logger";

interface ClaudeCodeEntry {
  user_email: string;
  date: string;
  sessions: number;
  commits: number;
  pull_requests: number;
  lines_added: number;
  lines_removed: number;
  estimated_cost_usd: number;
}

export async function syncClaudeCodeAnalytics(
  organizationId: string
): Promise<{ synced: number; error?: string }> {
  const conn = await prisma.providerConnection.findUnique({
    where: {
      organizationId_provider: { organizationId, provider: "anthropic" },
    },
  });

  if (!conn || conn.status !== "connected" || !conn.encryptedApiKey) {
    return { synced: 0, error: "Provider not connected" };
  }

  const apiKey = decrypt(conn.encryptedApiKey);

  const endDate = new Date();
  const startDate = subDays(endDate, 7);
  const run = await startSyncRun(organizationId, "claude_code");

  try {
    const url = new URL("https://api.anthropic.com/v1/claude-code/usage");
    url.searchParams.set("start_date", startDate.toISOString().split("T")[0]);
    url.searchParams.set("end_date", endDate.toISOString().split("T")[0]);

    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "claude-code-usage-2024-10-07",
      },
    });

    if (!res.ok) {
      throw new Error(`Claude Code API error ${res.status}`);
    }

    const data: { data: ClaudeCodeEntry[] } = await res.json();
    let synced = 0;

    // Build team lookup by user email
    const teamMembers = await prisma.teamMember.findMany({
      where: { team: { organizationId } },
      include: { team: true, user: true },
    });
    const emailToTeamId: Record<string, string> = {};
    for (const tm of teamMembers) {
      emailToTeamId[tm.user.email] = tm.teamId;
    }

    for (const entry of data.data) {
      const date = startOfDay(new Date(entry.date));
      const teamId = emailToTeamId[entry.user_email] ?? null;

      await prisma.claudeCodeDaily.upsert({
        where: {
          organizationId_userEmail_date: {
            organizationId,
            userEmail: entry.user_email,
            date,
          },
        },
        create: {
          organizationId,
          userEmail: entry.user_email,
          teamId,
          date,
          sessions: entry.sessions,
          commits: entry.commits,
          pullRequests: entry.pull_requests,
          linesAdded: entry.lines_added,
          linesRemoved: entry.lines_removed,
          estimatedCostUsd: entry.estimated_cost_usd.toFixed(6),
        },
        update: {
          teamId,
          sessions: entry.sessions,
          commits: entry.commits,
          pullRequests: entry.pull_requests,
          linesAdded: entry.lines_added,
          linesRemoved: entry.lines_removed,
          estimatedCostUsd: entry.estimated_cost_usd.toFixed(6),
        },
      });
      synced++;
    }

    await prisma.providerConnection.update({
      where: { organizationId_provider: { organizationId, provider: "anthropic" } },
      data: { lastClaudeCodeSyncedAt: new Date() } as any,
    }).catch(() => null); // non-fatal

    await completeSyncRun(run.id, synced);
    return { synced };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    await failSyncRun(run.id, err);
    return { synced: 0, error };
  }
}
