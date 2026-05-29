/**
 * Cursor Admin API connector.
 *
 * Requires an Admin API Key from Cursor team settings.
 * Base URL: https://api.cursor.com
 *
 * What we can fetch:
 *   - Member list with emails (seat count)
 *   - Daily usage per user: lines added/deleted, suggestions accepted/shown
 *   - Per-user spending in cents (premium requests only)
 *
 * What we CANNOT fetch:
 *   - Base subscription cost (flat rate, not in API)
 *   - Granular usage events (Enterprise-only endpoint)
 *   - History beyond 30-day API window
 *
 * Endpoint note: Cursor's API is not fully publicly documented.
 * We try primary paths first, then fall back to alternates.
 * If an endpoint returns 404, we skip it gracefully and log a warning.
 */

const BASE = "https://api.cursor.com";

// Alternative base URLs to try if primary fails
const ALT_BASES = ["https://api.cursor.sh"];

async function cursorFetch(apiKey: string, path: string): Promise<unknown> {
  const urls = [BASE, ...ALT_BASES].map(b => `${b}${path}`);
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 404) {
        // Endpoint doesn't exist at this base — try next
        lastError = new Error(`404 Not Found: ${url}`);
        continue;
      }
      if (res.status === 401) {
        throw new Error("Invalid Cursor API key — check your Admin API key in Cursor Settings");
      }
      if (res.status === 403) {
        throw new Error("Cursor API key does not have admin permissions — ensure you are using an Admin API key, not a personal key");
      }
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Cursor API ${res.status}: ${body.slice(0, 300)}`);
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return await res.json();
      }
      return await res.text();
    } catch (err) {
      if (err instanceof Error && (err.message.includes("Invalid") || err.message.includes("admin permissions"))) {
        throw err; // Auth errors — don't retry
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error(`Cursor API unreachable for path: ${path}`);
}

/** Try multiple endpoint paths for the same resource, return first success */
async function cursorFetchWithFallback(
  apiKey: string,
  paths: string[]
): Promise<{ data: unknown; path: string } | null> {
  for (const path of paths) {
    try {
      const data = await cursorFetch(apiKey, path);
      return { data, path };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Invalid") || msg.includes("admin permissions")) throw err;
      // 404 or network error — try next path
      continue;
    }
  }
  return null;
}

export interface CursorMember {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface CursorDailyUsage {
  date: string; // "YYYY-MM-DD"
  user_email: string;
  lines_added: number;
  lines_deleted: number;
  suggestions_shown: number;
  suggestions_accepted: number;
  tab_completions: number;
  composer_requests: number;
  chat_requests: number;
  agent_requests: number;
  model_usage?: Record<string, number>;
}

export interface CursorSpending {
  user_email: string;
  spend_cents: number;
  premium_requests: number;
}

export async function testCursorConnection(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await cursorFetchWithFallback(apiKey, [
      "/v1/members?limit=1",
      "/members?limit=1",
      "/v1/team/members?limit=1",
      "/team/members?limit=1",
    ]);
    if (!result) {
      return { ok: false, error: "Cursor API endpoints not found — the API may have changed. Sync will attempt all known paths." };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchCursorMembers(apiKey: string): Promise<CursorMember[]> {
  const result = await cursorFetchWithFallback(apiKey, [
    "/v1/members",
    "/members",
    "/v1/team/members",
    "/team/members",
  ]);
  if (!result) return [];
  const d = result.data as Record<string, unknown>;
  const members = (d?.members ?? d?.data ?? d) as CursorMember[] | undefined;
  return Array.isArray(members) ? members : [];
}

export async function fetchCursorDailyUsage(
  apiKey: string,
  startDate: Date,
  endDate: Date
): Promise<CursorDailyUsage[]> {
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const qs = `?start_date=${fmt(startDate)}&end_date=${fmt(endDate)}`;

  const result = await cursorFetchWithFallback(apiKey, [
    `/v1/usage/daily${qs}`,
    `/usage/daily${qs}`,
    `/v1/analytics/daily${qs}`,
    `/analytics/daily${qs}`,
  ]);
  if (!result) return [];
  const d = result.data as Record<string, unknown>;
  const rows = (d?.data ?? d?.usage ?? d) as CursorDailyUsage[] | undefined;
  return Array.isArray(rows) ? rows : [];
}

export async function fetchCursorSpending(apiKey: string): Promise<CursorSpending[]> {
  const result = await cursorFetchWithFallback(apiKey, [
    "/v1/spending",
    "/spending",
    "/v1/billing/spending",
    "/billing/spending",
  ]);
  if (!result) return [];
  const d = result.data as Record<string, unknown>;
  const rows = (d?.users ?? d?.data ?? d) as CursorSpending[] | undefined;
  return Array.isArray(rows) ? rows : [];
}
