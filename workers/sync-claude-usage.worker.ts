import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { ClaudeAdminClient } from "@/modules/claude/client";
import { subDays, startOfDay } from "date-fns";
import { startSyncRun, completeSyncRun, failSyncRun } from "./sync-run-logger";

/**
 * Auto-discover users seen in Anthropic usage data.
 * If an email appears in usage but has no User + OrganizationMember record,
 * create them as a viewer so they show up in the Users page.
 * Teams are NOT auto-created — Anthropic has no team data.
 * Returns an updated email → teamId map.
 */
async function ensureUsersExist(
  organizationId: string,
  emails: string[],
  existingEmailToTeamId: Record<string, string>
): Promise<{ emailToTeamId: Record<string, string>; newUsersCreated: number }> {
  if (emails.length === 0) return { emailToTeamId: existingEmailToTeamId, newUsersCreated: 0 };

  // Find all User records for these emails (may already exist from seed or prior syncs)
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  });
  const existingEmailSet = new Set(existingUsers.map(u => u.email));

  // Find which of the existing users already have an OrganizationMember record for THIS org
  const existingMemberships = await prisma.organizationMember.findMany({
    where: {
      organizationId,
      userId: { in: existingUsers.map(u => u.id) },
    },
    select: { userId: true },
  });
  const memberUserIds = new Set(existingMemberships.map(m => m.userId));

  let newUsersCreated = 0;

  // Case 1: User record exists but has no membership in this org → add membership only
  for (const u of existingUsers) {
    if (!memberUserIds.has(u.id)) {
      try {
        await prisma.organizationMember.create({
          data: { organizationId, userId: u.id, role: "viewer" },
        });
      } catch {
        // Concurrent sync already created it — safe to ignore
      }
    }
  }

  // Case 2: No User record at all → create User + OrganizationMember
  const newEmails = emails.filter(e => !existingEmailSet.has(e));

  for (const email of newEmails) {
    // Derive a display name from the email local-part (e.g. "alice.chen@..." → "Alice Chen")
    const localPart = email.split("@")[0] ?? email;
    const name = localPart
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

    try {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          // Unusable hash — they cannot log in until an admin resets their password
          passwordHash: "$2a$10$LOCKED_AUTO_DISCOVERED_USER_PLACEHOLDER_HASH",
        },
      });

      await prisma.organizationMember.create({
        data: { organizationId, userId: user.id, role: "viewer" },
      });

      newUsersCreated++;
    } catch {
      // Concurrent sync race — safe to ignore
    }
  }

  return { emailToTeamId: existingEmailToTeamId, newUsersCreated };
}

export async function syncClaudeUsage(
  organizationId: string
): Promise<{ synced: number; newUsers: number; error?: string }> {
  const conn = await prisma.providerConnection.findUnique({
    where: { organizationId_provider: { organizationId, provider: "anthropic" } },
  });

  if (!conn || conn.status !== "connected" || !conn.encryptedApiKey) {
    return { synced: 0, newUsers: 0, error: "Provider not connected" };
  }

  const apiKey = decrypt(conn.encryptedApiKey);
  const client = new ClaudeAdminClient(apiKey);

  const endDate = new Date();
  const startDate = subDays(endDate, 7);
  const run = await startSyncRun(organizationId, "anthropic");

  try {
    // Fetch all usage entries from Anthropic (paginated)
    const entries = await client.getUsage(
      startDate.toISOString(),
      endDate.toISOString()
    );

    // Collect all unique emails seen in this sync batch
    const seenEmails = [...new Set(entries.map(e => e.user_id))];

    // Build email → teamId lookup from DB (existing assignments)
    const teamMembers = await prisma.teamMember.findMany({
      where: { team: { organizationId } },
      include: { user: { select: { email: true } } },
    });
    const emailToTeamId: Record<string, string> = {};
    for (const tm of teamMembers) {
      emailToTeamId[tm.user.email] = tm.teamId;
    }

    // Auto-create User + OrganizationMember records for any new emails
    const { newUsersCreated } = await ensureUsersExist(
      organizationId,
      seenEmails,
      emailToTeamId
    );

    let synced = 0;

    for (const entry of entries) {
      const date = startOfDay(new Date(entry.start_time));
      const totalTokens = entry.input_tokens + entry.output_tokens;
      const totalCostUsd = (entry.cost_usd ?? 0).toFixed(6);
      const teamId = emailToTeamId[entry.user_id] ?? null;

      await prisma.usageDaily.upsert({
        where: {
          organizationId_provider_date_userEmail: {
            organizationId,
            provider: "anthropic",
            date,
            userEmail: entry.user_id,
          },
        },
        create: {
          organizationId,
          provider: "anthropic",
          date,
          userEmail: entry.user_id,
          teamId,
          inputTokens: entry.input_tokens,
          outputTokens: entry.output_tokens,
          cachedTokens: entry.cache_read_input_tokens,
          totalTokens,
          totalCostUsd,
        },
        update: {
          // SET (overwrite) — Anthropic returns cumulative daily totals,
          // so re-syncing the same day must replace, not add on top.
          teamId,
          inputTokens:  entry.input_tokens,
          outputTokens: entry.output_tokens,
          cachedTokens: entry.cache_read_input_tokens,
          totalTokens,
          totalCostUsd,
        },
      });

      // Model-level breakdown
      await prisma.modelUsageDaily.upsert({
        where: {
          organizationId_provider_model_date: {
            organizationId,
            provider: "anthropic",
            model: entry.model,
            date,
          },
        },
        create: {
          organizationId,
          provider: "anthropic",
          model: entry.model,
          date,
          inputTokens:  entry.input_tokens,
          outputTokens: entry.output_tokens,
          totalTokens,
          totalCostUsd,
        },
        update: {
          // SET — same reason, overwrite with latest cumulative value
          inputTokens:  entry.input_tokens,
          outputTokens: entry.output_tokens,
          totalTokens,
          totalCostUsd,
        },
      });

      synced++;
    }

    await prisma.providerConnection.update({
      where: { organizationId_provider: { organizationId, provider: "anthropic" } },
      data: {
        lastSyncAt:        new Date(),
        lastSyncError:     null,
        status:            "connected",
        lastUsageSyncedAt: new Date(),
      } as any,
    });

    await completeSyncRun(run.id, synced);
    return { synced, newUsers: newUsersCreated };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    await prisma.providerConnection.update({
      where: { organizationId_provider: { organizationId, provider: "anthropic" } },
      data: { status: "failed", lastSyncError: error },
    });
    await failSyncRun(run.id, err);
    return { synced: 0, newUsers: 0, error };
  }
}
