export interface ClaudeCodeStats {
  sessions: number;
  commits: number;
  pullRequests: number;
  linesAdded: number;
  estimatedCostUsd: number;
}

export interface ProviderStatus {
  status: "not_connected" | "connected" | "failed" | "disabled";
  lastSyncAt: string | null;
  lastSyncError: string | null;
  hasApiKey: boolean;
}
