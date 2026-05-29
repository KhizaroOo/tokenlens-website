/**
 * GitHub Copilot connector.
 *
 * Credential format stored: JSON { "org": "my-org", "token": "ghp_xxx" }
 *
 * Required PAT scopes: manage_billing:copilot  (or read:org for read-only)
 * Copilot plan required: Business or Enterprise
 *
 * What we can fetch:
 *   - Seat counts: total, active, inactive
 *   - Per-user acceptance rates, last activity, editor used
 *   - Suggestion / completion metrics (28-day rolling)
 *
 * What we CANNOT fetch:
 *   - Dollar cost (computed: seats × $19/month)
 *   - Model-level breakdown
 *   - Data before Oct 10, 2025
 *
 * Note: Old /orgs/{org}/copilot/metrics endpoints retired April 2, 2026.
 * We use the new /copilot/metrics/reports/* endpoints.
 */

const BASE = "https://api.github.com";

export interface GitHubCredential {
  org: string;
  token: string;
}

export function parseGitHubCredential(raw: string): GitHubCredential {
  try { return JSON.parse(raw); } catch { throw new Error("Invalid GitHub credential format"); }
}

interface CopilotSeat {
  assignee: { login: string; email?: string };
  last_activity_at: string | null;
  last_activity_editor: string | null;
  plan_type: string;
}

interface CopilotSeatsResponse {
  total_seats: number;
  seats: CopilotSeat[];
}

interface CopilotUserMetric {
  user_id: number;
  user_login: string;
  last_activity_at: string | null;
  total_completions_count?: number;
  total_completions_accepted_count?: number;
  total_active_days?: number;
}

async function ghFetch(token: string, path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization:        `Bearer ${token}`,
      Accept:               "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

export async function testGitHubConnection(cred: GitHubCredential): Promise<{ ok: boolean; error?: string }> {
  try {
    await ghFetch(cred.token, `/orgs/${cred.org}/copilot/billing/seats?per_page=1`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchCopilotSeats(cred: GitHubCredential): Promise<CopilotSeatsResponse> {
  const allSeats: CopilotSeat[] = [];
  let page = 1;
  let totalSeats = 0;

  while (true) {
    const data = await ghFetch(
      cred.token,
      `/orgs/${cred.org}/copilot/billing/seats?per_page=100&page=${page}`
    );
    totalSeats = data.total_seats ?? 0;
    const batch: CopilotSeat[] = data.seats ?? [];
    allSeats.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  return { total_seats: totalSeats, seats: allSeats };
}

export async function fetchCopilotUserMetrics(
  cred: GitHubCredential
): Promise<{ metrics: CopilotUserMetric[]; source: "metrics_api" | "seat_data" | "none" }> {
  // Try new metrics endpoint (post-April 2026)
  const newEndpoints = [
    `/orgs/${cred.org}/copilot/metrics/reports/users-28-day/latest`,
    `/orgs/${cred.org}/copilot/usage`,
  ];

  for (const endpoint of newEndpoints) {
    try {
      const data = await ghFetch(cred.token, endpoint);
      const users = data.users ?? data.data ?? [];
      if (Array.isArray(users) && users.length > 0) {
        return { metrics: users, source: "metrics_api" };
      }
    } catch {
      // Try next endpoint
      continue;
    }
  }

  // Fallback: derive basic metrics from seat data
  try {
    const { seats } = await fetchCopilotSeats(cred);
    const derived: CopilotUserMetric[] = seats.map(s => ({
      user_id: 0,
      user_login: s.assignee.login,
      last_activity_at: s.last_activity_at,
      total_completions_count: 0,
      total_completions_accepted_count: 0,
      total_active_days: s.last_activity_at
        ? ((Date.now() - new Date(s.last_activity_at).getTime()) / 86400000 <= 7 ? 1 : 0)
        : 0,
    }));
    return { metrics: derived, source: "seat_data" };
  } catch {
    return { metrics: [], source: "none" };
  }
}
