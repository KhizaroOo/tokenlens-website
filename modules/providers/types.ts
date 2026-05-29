// ── Phase 2: Provider Registry Types ─────────────────────────────────────────

export type ProviderCategory = "api_spend" | "developer_ai" | "business_ai";

export type ProviderKey =
  | "anthropic"
  | "openai"
  | "gemini"
  | "perplexity"
  | "claude_code"
  | "github_copilot"
  | "cursor"
  | "microsoft_copilot";

export interface ProviderDefinition {
  key: ProviderKey;
  label: string;
  category: ProviderCategory;
  /** Short description shown in the Providers hub */
  description: string;
  /** Whether this provider uses seat/license-based pricing */
  seatBased: boolean;
  /** Whether this provider tracks token usage */
  tokenBased: boolean;
  /** Whether this provider tracks developer activity (sessions, commits, etc.) */
  activityBased: boolean;
  /** Whether real API integration is available (Phase 2B+) */
  realConnectorAvailable: boolean;
  /** Cost per seat per month (USD), if seat-based */
  defaultCostPerSeat?: number;
  /** Tailwind color class for accent */
  color: string;
}

// ── Sync / Usage types ────────────────────────────────────────────────────────

export interface ProviderSyncResult {
  provider: ProviderKey;
  recordsSynced: number;
  newUsers: number;
  error?: string;
}

/** Unified daily usage row returned by /api/usage routes */
export interface UnifiedUsageRow {
  provider: ProviderKey;
  category: ProviderCategory;
  date: string;           // "YYYY-MM-DD"
  userEmail: string;
  teamId?: string | null;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
  totalCostUsd: number;
}

/** Summary card data for the Providers hub */
export interface ProviderSummary {
  provider: ProviderKey;
  label: string;
  category: ProviderCategory;
  color: string;
  totalCostUsd: number;
  totalTokens: number;
  activeUsers: number;
  activeSeats: number;
  lastSyncAt: string | null;
  status: "connected" | "not_connected";
}
