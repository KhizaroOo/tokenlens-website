export interface DailyUsage {
  date: string;
  userEmail: string;
  teamId?: string | null;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
  totalCostUsd: number;
}

export interface ModelUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
}

export interface DashboardStats {
  totalCostUsd: number;
  totalTokens: number;
  activeUsers: number;
  dailySpend: { date: string; cost: number; tokens: number }[];
}
