import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import {
  getProviderCredential, markProviderFailed, markProviderSynced,
} from "@/modules/providers/connector.interface";
import {
  parseGitHubCredential, fetchCopilotSeats, fetchCopilotUserMetrics,
} from "@/modules/providers/github_copilot/connector";
import { startSyncRun, completeSyncRun, failSyncRun } from "./sync-run-logger";

// GitHub Copilot Business: $19/seat/month → ~$0.63/seat/day
const COPILOT_COST_PER_SEAT_MONTHLY = 19;

export async function syncGitHubCopilot(
  organizationId: string
): Promise<{ synced: number; errors: string[] }> {
  const raw = await getProviderCredential(organizationId, "github_copilot");
  if (!raw) return { synced: 0, errors: ["GitHub Copilot not connected"] };

  const errors: string[] = [];
  const run = await startSyncRun(organizationId, "github_copilot");

  try {
    // Clear demo/seed data before writing real API data
    await Promise.all([
      prisma.developerAiDaily.deleteMany({ where: { organizationId, provider: "github_copilot" } }),
      prisma.seatUsageDaily.deleteMany({ where: { organizationId, provider: "github_copilot" } }),
      prisma.providerUserMapping.deleteMany({ where: { organizationId, provider: "github_copilot" } }),
    ]);

    const cred = parseGitHubCredential(raw);
    const today = startOfDay(new Date());

    // ── Seat utilization ──────────────────────────────────────────────────────
    const { total_seats, seats } = await fetchCopilotSeats(cred);
    const activeSeats = seats.filter(s => {
      if (!s.last_activity_at) return false;
      const lastActive = new Date(s.last_activity_at);
      const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;

    const costPerSeat = (COPILOT_COST_PER_SEAT_MONTHLY / 30).toFixed(6);
    const totalCost   = ((total_seats * COPILOT_COST_PER_SEAT_MONTHLY) / 30).toFixed(6);

    await prisma.seatUsageDaily.upsert({
      where: { organizationId_provider_date: { organizationId, provider: "github_copilot", date: today } },
      create: {
        organizationId, provider: "github_copilot", date: today,
        totalSeats: total_seats, activeSeats,
        costPerSeat, totalCostUsd: totalCost,
      },
      update: { totalSeats: total_seats, activeSeats, costPerSeat, totalCostUsd: totalCost },
    });

    // ── Per-user metrics ──────────────────────────────────────────────────────
    const { metrics: userMetrics, source: metricsSource } = await fetchCopilotUserMetrics(cred);
    if (metricsSource === "none") {
      errors.push("Warning: GitHub Copilot metrics API unavailable — seat count synced but per-user metrics skipped");
    }
    let synced = 1; // seat row

    // Map seat data for users not in metrics API response
    const seatMap = new Map(seats.map(s => [s.assignee.login, s]));

    const allLogins = new Set([
      ...userMetrics.map(u => u.user_login),
      ...seats.map(s => s.assignee.login),
    ]);

    for (const login of allLogins) {
      const metric = userMetrics.find(u => u.user_login === login);
      const seat   = seatMap.get(login);
      const email  = seat?.assignee.email ?? `${login}@github`;

      // Infer active days from last_activity_at
      let activeDays = 0;
      const lastAt = metric?.last_activity_at ?? seat?.last_activity_at;
      if (lastAt) {
        const daysSince = (Date.now() - new Date(lastAt).getTime()) / (1000 * 60 * 60 * 24);
        activeDays = daysSince <= 7 ? 1 : 0;
      }

      const suggestions  = metric?.total_completions_count ?? 0;
      const acceptances  = metric?.total_completions_accepted_count ?? 0;
      const sessions     = metric?.total_active_days ?? activeDays;

      try {
        await prisma.developerAiDaily.upsert({
          where: {
            organizationId_provider_date_userEmail: {
              organizationId, provider: "github_copilot", date: today, userEmail: email,
            },
          },
          create: {
            organizationId, provider: "github_copilot", date: today, userEmail: email,
            sessions, suggestions, acceptances,
            linesAdded: 0, linesRemoved: 0, filesChanged: 0,
            commitsAssisted: 0, prsAssisted: 0, completions: acceptances,
            totalCostUsd: "0",
          },
          update: { sessions, suggestions, acceptances, completions: acceptances },
        });

        // Upsert ProviderUserMapping so email → GitHub login is tracked
        await prisma.providerUserMapping.upsert({
          where: {
            organizationId_provider_providerUserId: {
              organizationId, provider: "github_copilot", providerUserId: login,
            },
          },
          create: { organizationId, provider: "github_copilot", providerUserId: login, userEmail: email },
          update: { userEmail: email },
        });

        synced++;
      } catch (rowErr) {
        errors.push(`${login}: ${rowErr instanceof Error ? rowErr.message : rowErr}`);
      }
    }

    await markProviderSynced(organizationId, "github_copilot");
    await completeSyncRun(run.id, synced);
    return { synced, errors };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await markProviderFailed(organizationId, "github_copilot", msg);
    await failSyncRun(run.id, err);
    return { synced: 0, errors: [msg] };
  }
}
