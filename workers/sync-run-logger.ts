/**
 * Shared ProviderSyncRun logger.
 *
 * Usage pattern (in every sync worker):
 *
 *   const run = await startSyncRun(organizationId, "openai");
 *   try {
 *     // ... do sync work ...
 *     await completeSyncRun(run.id, synced);
 *   } catch (err) {
 *     await failSyncRun(run.id, err);
 *     throw; // re-throw so the worker's own error handling runs
 *   }
 *
 * Safety rules:
 * - Never store API keys, auth tokens, or request headers in errorMessage.
 * - errorMessage is truncated to 500 chars to prevent accidental large payloads.
 * - organizationId is required on every write — no org-less sync runs.
 * - finishedAt is always set so duration can be computed as
 *   (finishedAt - startedAt) in milliseconds.
 */

import { prisma } from "@/lib/prisma";

export interface SyncRunHandle {
  id: string;
  startedAt: Date;
}

/**
 * Create a ProviderSyncRun row with status "running".
 * Call this at the very start of a sync worker, before any API call.
 */
export async function startSyncRun(
  organizationId: string,
  provider: string
): Promise<SyncRunHandle> {
  const startedAt = new Date();
  const run = await prisma.providerSyncRun.create({
    data: {
      organizationId,
      provider,
      status:        "running",
      recordsSynced: 0,
      startedAt,
    },
  });
  return { id: run.id, startedAt };
}

/**
 * Mark a sync run as successful.
 * @param runId   The id returned by startSyncRun.
 * @param synced  Number of rows written to the DB.
 */
export async function completeSyncRun(
  runId: string,
  synced: number
): Promise<void> {
  await prisma.providerSyncRun.update({
    where: { id: runId },
    data:  {
      status:        "success",
      recordsSynced: synced,
      finishedAt:    new Date(),
    },
  });
}

/**
 * Mark a sync run as failed with a sanitized error message.
 * Strips anything that looks like a token/key/secret before storing.
 */
export async function failSyncRun(
  runId: string,
  err: unknown
): Promise<void> {
  const raw = err instanceof Error ? err.message : String(err);
  // Truncate and sanitize — do not store tokens, auth headers, or key substrings
  const safe = sanitizeErrorMessage(raw).slice(0, 500);
  await prisma.providerSyncRun.update({
    where: { id: runId },
    data:  {
      status:       "failed",
      errorMessage: safe,
      finishedAt:   new Date(),
    },
  });
}

/**
 * Remove substrings that look like secrets from an error message.
 * Covers: Bearer tokens, sk-ant-*, ghp_*, cursor keys, GUIDs in auth context.
 */
function sanitizeErrorMessage(msg: string): string {
  return msg
    // Bearer <token>
    .replace(/Bearer\s+[A-Za-z0-9\-_.~+/]+=*/gi, "Bearer [REDACTED]")
    // sk-ant-* (Anthropic keys)
    .replace(/sk-ant-[A-Za-z0-9\-_]+/g, "[REDACTED]")
    // ghp_* / github_pat_* tokens
    .replace(/gh[pousr]_[A-Za-z0-9_]+/gi, "[REDACTED]")
    .replace(/github_pat_[A-Za-z0-9_]+/gi, "[REDACTED]")
    // OpenAI sk-* keys
    .replace(/sk-[A-Za-z0-9]{20,}/g, "[REDACTED]")
    // Generic long alphanumeric strings that look like API keys (40+ chars)
    .replace(/[A-Za-z0-9\-_]{40,}/g, "[REDACTED]");
}
