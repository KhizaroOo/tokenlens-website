/**
 * OpenAI Admin API connector.
 *
 * Requires an Admin API Key (not a project key).
 * Provisioned at: platform.openai.com/settings/organization/admin-keys
 *
 * What we can fetch:
 *   - Token usage per model, per user, per project (daily buckets)
 *   - Cost per project (daily buckets)
 *   - API keys list
 *
 * What we CANNOT fetch:
 *   - Billing invoices / payment methods
 *   - Sub-minute granularity (minimum 1-day buckets)
 */

const BASE = "https://api.openai.com/v1";

export interface OpenAIUsageResult {
  aggregation_timestamp: number;
  results: {
    input_tokens: number;
    output_tokens: number;
    input_cached_tokens: number;
    num_model_requests: number;
    project_id: string | null;
    user_id: string | null;
    model: string | null;
  }[];
}

export interface OpenAICostResult {
  aggregation_timestamp: number;
  results: {
    amount: { value: number; currency: string };
    project_id: string | null;
    line_item: string;
  }[];
}

async function oaiFetch(apiKey: string, path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function testOpenAIConnection(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    // Lightweight check — list admin keys (small payload)
    await oaiFetch(apiKey, "/organization/admin_api_keys?limit=1");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchOpenAIUsage(
  apiKey: string,
  startDate: Date,
  endDate: Date
): Promise<OpenAIUsageResult[]> {
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const pages: OpenAIUsageResult[] = [];
  let nextPage: string | null = null;

  do {
    const qs = new URLSearchParams({
      start_date: fmt(startDate),
      end_date:   fmt(endDate),
      bucket_width: "1d",
      group_by: "user_id,model,project_id",
      limit: "100",
    });
    if (nextPage) qs.set("page", nextPage);

    const data = await oaiFetch(apiKey, `/organization/usage/completions?${qs}`);
    pages.push(...(data.data ?? []));
    nextPage = data.has_more ? (data.next_page ?? null) : null;
  } while (nextPage);

  return pages;
}
