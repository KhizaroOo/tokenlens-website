const CLAUDE_API_BASE = "https://api.anthropic.com";

interface UsageEntry {
  user_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  start_time: string;
  cost_usd?: number;
}

interface UsageResponse {
  data: UsageEntry[];
  has_more: boolean;
  next_page?: string;
}

export class ClaudeAdminClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${CLAUDE_API_BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "usage-reporting-2024-10-07",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Claude API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async getUsage(startDate: string, endDate: string): Promise<UsageEntry[]> {
    const all: UsageEntry[] = [];
    let nextPage: string | undefined;

    do {
      const params: Record<string, string> = {
        start_time: startDate,
        end_time: endDate,
        limit: "100",
      };
      if (nextPage) params.page = nextPage;

      const data = await this.request<UsageResponse>("/v1/usage", params);
      all.push(...data.data);
      nextPage = data.has_more ? data.next_page : undefined;
    } while (nextPage);

    return all;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.request("/v1/usage", { limit: "1" });
      return true;
    } catch {
      return false;
    }
  }
}
