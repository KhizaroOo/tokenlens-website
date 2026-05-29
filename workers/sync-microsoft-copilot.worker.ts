import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import {
  getProviderCredential, markProviderFailed, markProviderSynced,
} from "@/modules/providers/connector.interface";
import {
  parseMicrosoftCredential, fetchM365CopilotUsers, fetchM365CopilotSeats,
} from "@/modules/providers/microsoft_copilot/connector";
import { startSyncRun, completeSyncRun, failSyncRun } from "./sync-run-logger";

// Microsoft 365 Copilot: $30/user/month → ~$1/user/day
const M365_COST_PER_SEAT_MONTHLY = 30;

// M365 apps we track — maps Graph field suffix to app name stored in DB
const APP_MAP: Record<string, string> = {
  Teams:       "teams",
  Word:        "word",
  Excel:       "excel",
  PowerPoint:  "powerpoint",
  Outlook:     "outlook",
  OneNote:     "onenote",
  Loop:        "loop",
  CopilotChat: "copilot_chat",
};

export async function syncMicrosoftCopilot(
  organizationId: string
): Promise<{ synced: number; errors: string[] }> {
  const raw = await getProviderCredential(organizationId, "microsoft_copilot");
  if (!raw) return { synced: 0, errors: ["Microsoft Copilot not connected"] };

  const errors: string[] = [];
  const run = await startSyncRun(organizationId, "microsoft_copilot");

  try {
    // Clear demo/seed data before writing real API data
    await Promise.all([
      prisma.businessAiDaily.deleteMany({ where: { organizationId, provider: "microsoft_copilot" } }),
      prisma.seatUsageDaily.deleteMany({ where: { organizationId, provider: "microsoft_copilot" } }),
      prisma.providerUserMapping.deleteMany({ where: { organizationId, provider: "microsoft_copilot" } }),
    ]);

    const cred  = parseMicrosoftCredential(raw);
    const today = startOfDay(new Date());

    // ── Licensed seat count ───────────────────────────────────────────────────
    const { totalLicensed } = await fetchM365CopilotSeats(cred);

    // ── Active users per app (D30 window) ────────────────────────────────────
    const users = await fetchM365CopilotUsers(cred, "D30");
    const licensedUsers = users.filter(u => u.hasCopilotLicense);

    // Count active users per app
    const appActiveMap: Record<string, number> = {};
    for (const [graphSuffix, appName] of Object.entries(APP_MAP)) {
      const fieldKey = `lastActivityDate${graphSuffix}` as keyof typeof users[0];
      const activeCount = licensedUsers.filter(u => {
        const val = u[fieldKey] as string | undefined;
        return val && val !== "";
      }).length;
      appActiveMap[appName] = activeCount;
    }

    // Seat utilization: users who had ANY app activity in D30
    const activeSeats = licensedUsers.filter(u =>
      Object.keys(APP_MAP).some(s => {
        const key = `lastActivityDate${s}` as keyof typeof u;
        return u[key] && u[key] !== "";
      })
    ).length;

    // Upsert seat row
    const costPerSeat = (M365_COST_PER_SEAT_MONTHLY / 30).toFixed(6);
    const totalCost   = ((totalLicensed * M365_COST_PER_SEAT_MONTHLY) / 30).toFixed(6);

    await prisma.seatUsageDaily.upsert({
      where: { organizationId_provider_date: { organizationId, provider: "microsoft_copilot", date: today } },
      create: {
        organizationId, provider: "microsoft_copilot", date: today,
        totalSeats: totalLicensed, activeSeats, costPerSeat, totalCostUsd: totalCost,
      },
      update: { totalSeats: totalLicensed, activeSeats, costPerSeat, totalCostUsd: totalCost },
    });

    let synced = 1;

    // Upsert per-app BusinessAiDaily rows
    for (const [appName, activeUsers] of Object.entries(appActiveMap)) {
      const appCost = ((activeUsers * M365_COST_PER_SEAT_MONTHLY) / 30).toFixed(6);
      try {
        await prisma.businessAiDaily.upsert({
          where: {
            organizationId_provider_app_date: {
              organizationId, provider: "microsoft_copilot", app: appName, date: today,
            },
          },
          create: {
            organizationId, provider: "microsoft_copilot", app: appName, date: today,
            activeUsers, totalSessions: activeUsers, totalCostUsd: appCost,
          },
          update: { activeUsers, totalSessions: activeUsers, totalCostUsd: appCost },
        });
        synced++;
      } catch (rowErr) {
        errors.push(`App ${appName}: ${rowErr instanceof Error ? rowErr.message : rowErr}`);
      }
    }

    // User mappings
    for (const u of licensedUsers) {
      try {
        await prisma.providerUserMapping.upsert({
          where: {
            organizationId_provider_providerUserId: {
              organizationId, provider: "microsoft_copilot",
              providerUserId: u.userPrincipalName,
            },
          },
          create: {
            organizationId, provider: "microsoft_copilot",
            providerUserId: u.userPrincipalName,
            userEmail: u.userPrincipalName,
          },
          update: { userEmail: u.userPrincipalName },
        });
      } catch { /* ignore mapping conflicts */ }
    }

    await markProviderSynced(organizationId, "microsoft_copilot");
    await completeSyncRun(run.id, synced);
    return { synced, errors };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await markProviderFailed(organizationId, "microsoft_copilot", msg);
    await failSyncRun(run.id, err);
    return { synced: 0, errors: [msg] };
  }
}
