import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export interface SyncResult {
  synced: number;
  errors: string[];
}

export interface IProviderConnector {
  testConnection(): Promise<{ ok: boolean; error?: string }>;
  syncUsage(organizationId: string, startDate: Date, endDate: Date): Promise<SyncResult>;
  syncSeats?(organizationId: string): Promise<SyncResult>;
}

/** Load and decrypt a provider's stored credential for an org. Returns null if not connected. */
export async function getProviderCredential(
  organizationId: string,
  provider: string
): Promise<string | null> {
  const conn = await prisma.providerConnection.findUnique({
    where: { organizationId_provider: { organizationId, provider } },
  });
  if (!conn || conn.status !== "connected" || !conn.encryptedApiKey) return null;
  return decrypt(conn.encryptedApiKey);
}

/** Mark a provider connection as failed in the DB. */
export async function markProviderFailed(
  organizationId: string,
  provider: string,
  error: string
) {
  await prisma.providerConnection.update({
    where: { organizationId_provider: { organizationId, provider } },
    data: { status: "failed", lastSyncError: error },
  });
}

/** Mark a provider connection as successfully synced. */
export async function markProviderSynced(
  organizationId: string,
  provider: string
) {
  await prisma.providerConnection.update({
    where: { organizationId_provider: { organizationId, provider } },
    data: { status: "connected", lastSyncAt: new Date(), lastSyncError: null },
  });
}
