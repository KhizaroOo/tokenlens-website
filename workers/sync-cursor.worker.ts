import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";
import {
  getProviderCredential, markProviderFailed, markProviderSynced,
} from "@/modules/providers/connector.interface";
import {
  fetchCursorMembers, fetchCursorDailyUsage, fetchCursorSpending,
} from "@/modules/providers/cursor/connector";
import { startSyncRun, completeSyncRun, failSyncRun } from "./sync-run-logger";

// Cursor Business: $40/seat/month → ~$1.33/seat/day
const CURSOR_COST_PER_SEAT_MONTHLY = 40;

export async function syncCursor(
  organizationId: string
): Promise<{ synced: number; errors: string[] }> {
  const apiKey = await getProviderCredential(organizationId, "cursor");
  if (!apiKey) return { synced: 0, errors: ["Cursor not connected"] };

  const errors: string[] = [];
  const run = await startSyncRun(organizationId, "cursor");

  try {
    // Clear demo/seed data before writing real API data
    await Promise.all([
      prisma.developerAiDaily.deleteMany({ where: { organizationId, provider: "cursor" } }),
      prisma.seatUsageDaily.deleteMany({ where: { organizationId, provider: "cursor" } }),
    ]);

    const endDate   = new Date();
    const startDate = subDays(endDate, 7);

    // ── Members (for seat count) ──────────────────────────────────────────────
    const members = await fetchCursorMembers(apiKey);
    const totalSeats = members.length;
    const today = startOfDay(new Date());

    // ── Daily usage per user ──────────────────────────────────────────────────
    const dailyRows = await fetchCursorDailyUsage(apiKey, startDate, endDate);

    // ── Spending ──────────────────────────────────────────────────────────────
    const spendRows = await fetchCursorSpending(apiKey);
    const spendMap  = new Map(spendRows.map(s => [s.user_email, s.spend_cents / 100]));

    // Warn if all endpoints returned 404 (empty data)
    if (members.length === 0 && dailyRows.length === 0) {
      errors.push("Warning: Cursor API returned no members or usage data — all endpoint paths may have returned 404. Verify your Admin API key and ensure your Cursor plan supports the API.");
    }

    // Seat utilization from members who had activity in last 7 days
    const activeEmails = new Set(dailyRows.map(r => r.user_email));
    const activeSeats  = [...activeEmails].filter(e =>
      dailyRows.some(r => r.user_email === e && (r.suggestions_accepted > 0 || r.lines_added > 0))
    ).length;

    const costPerSeat = (CURSOR_COST_PER_SEAT_MONTHLY / 30).toFixed(6);
    const totalCost   = ((totalSeats * CURSOR_COST_PER_SEAT_MONTHLY) / 30).toFixed(6);

    await prisma.seatUsageDaily.upsert({
      where: { organizationId_provider_date: { organizationId, provider: "cursor", date: today } },
      create: {
        organizationId, provider: "cursor", date: today,
        totalSeats, activeSeats, costPerSeat, totalCostUsd: totalCost,
      },
      update: { totalSeats, activeSeats, costPerSeat, totalCostUsd: totalCost },
    });

    let synced = 1;

    // ── Per-user daily rows ───────────────────────────────────────────────────
    for (const row of dailyRows) {
      const date     = startOfDay(new Date(row.date));
      const spendUsd = spendMap.get(row.user_email) ?? 0;

      try {
        await prisma.developerAiDaily.upsert({
          where: {
            organizationId_provider_date_userEmail: {
              organizationId, provider: "cursor", date, userEmail: row.user_email,
            },
          },
          create: {
            organizationId, provider: "cursor", date, userEmail: row.user_email,
            sessions: row.composer_requests + row.chat_requests + row.agent_requests > 0 ? 1 : 0,
            linesAdded:     row.lines_added,
            linesRemoved:   row.lines_deleted,
            filesChanged:   0,
            commitsAssisted: 0,
            prsAssisted:    0,
            suggestions:    row.suggestions_shown,
            acceptances:    row.suggestions_accepted,
            completions:    row.tab_completions,
            totalCostUsd:   spendUsd.toFixed(6),
          },
          update: {
            linesAdded:   row.lines_added,
            linesRemoved: row.lines_deleted,
            suggestions:  row.suggestions_shown,
            acceptances:  row.suggestions_accepted,
            completions:  row.tab_completions,
            totalCostUsd: spendUsd.toFixed(6),
          },
        });
        synced++;
      } catch (rowErr) {
        errors.push(`${row.user_email}/${row.date}: ${rowErr instanceof Error ? rowErr.message : rowErr}`);
      }
    }

    await markProviderSynced(organizationId, "cursor");
    await completeSyncRun(run.id, synced);
    return { synced, errors };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await markProviderFailed(organizationId, "cursor", msg);
    await failSyncRun(run.id, err);
    return { synced: 0, errors: [msg] };
  }
}
