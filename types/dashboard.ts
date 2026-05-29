export interface TeamSummary {
  id: string;
  name: string;
  memberCount: number;
  totalCostUsd: number;
  totalTokens: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string | null;
  totalCostUsd: number;
  totalTokens: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: string;
  period: string;
  enabled: boolean;
}
