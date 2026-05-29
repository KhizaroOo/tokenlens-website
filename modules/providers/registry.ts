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

export type DataCoverage =
  | "full"
  | "partial"
  | "estimated"
  | "seat_based"
  | "manual_mapping_required"
  | "csv_import_only"
  | "requires_enterprise"
  | "coming_soon";

export type ProviderCapability =
  | "cost"
  | "tokens"
  | "models"
  | "users"
  | "projects"
  | "api_keys"
  | "developer_activity"
  | "seat_usage"
  | "business_app_usage"
  | "reports"
  | "alerts"
  | "estimated_cost"
  | "csv_import";

export type AuthType =
  | "admin_api_key"
  | "api_key"
  | "oauth_enterprise"
  | "github_app_pat"
  | "google_cloud"
  | "microsoft_graph"
  | "csv_import"
  | "uses_anthropic";

export type ProviderAvailability = "available" | "coming_soon";

export interface ProviderDefinition {
  key: ProviderKey;
  displayName: string;
  shortName: string;
  category: ProviderCategory;
  description: string;
  authType: AuthType;
  credentialLabel: string;
  availability: ProviderAvailability;
  capabilities: ProviderCapability[];
  dataCoverage: DataCoverage;
  comingSoon: boolean;
  limited?: boolean;          // true = no admin API, routes to /limitations
  defaultSyncFrequencyHours: number;
  accentColor: string;
}

export const PROVIDERS: ProviderDefinition[] = [
  // LLM / API Spend
  {
    key: "anthropic",
    displayName: "Claude / Anthropic",
    shortName: "Claude",
    category: "api_spend",
    description: "Full API usage, token breakdown, model analytics, and cost tracking via Anthropic Admin API.",
    authType: "admin_api_key",
    credentialLabel: "Admin API Key",
    availability: "available",
    capabilities: ["cost", "tokens", "models", "users", "reports", "alerts"],
    dataCoverage: "full",
    comingSoon: false,
    defaultSyncFrequencyHours: 24,
    accentColor: "emerald",
  },
  {
    key: "openai",
    displayName: "OpenAI",
    shortName: "OpenAI",
    category: "api_spend",
    description: "Track GPT-4o, GPT-4-turbo, and other model usage, costs, and project-level spend.",
    authType: "admin_api_key",
    credentialLabel: "Admin API Key / Org Key",
    availability: "available",
    capabilities: ["cost", "tokens", "models", "projects", "api_keys", "reports", "alerts"],
    dataCoverage: "partial",
    comingSoon: false,
    defaultSyncFrequencyHours: 24,
    accentColor: "cyan",
  },
  {
    key: "gemini",
    displayName: "Gemini",
    shortName: "Gemini",
    category: "api_spend",
    description: "No admin API available. Google does not provide a programmatic endpoint to query aggregate Gemini usage or cost across an organisation. See Provider Limitations for details.",
    authType: "api_key",
    credentialLabel: "No Admin API — see Provider Limitations",
    availability: "available",
    capabilities: ["estimated_cost"],
    dataCoverage: "estimated",
    comingSoon: false,
    limited: true,
    defaultSyncFrequencyHours: 0,
    accentColor: "amber",
  },
  {
    key: "perplexity",
    displayName: "Perplexity",
    shortName: "Perplexity",
    category: "api_spend",
    description: "No admin API available. Perplexity does not expose a programmatic billing or usage REST API at any plan tier. See Provider Limitations for details.",
    authType: "api_key",
    credentialLabel: "No Admin API — see Provider Limitations",
    availability: "available",
    capabilities: ["estimated_cost"],
    dataCoverage: "estimated",
    comingSoon: false,
    limited: true,
    defaultSyncFrequencyHours: 0,
    accentColor: "amber",
  },
  // Developer AI Tools
  {
    key: "claude_code",
    displayName: "Claude Code",
    shortName: "CC",
    category: "developer_ai",
    description: "Developer sessions, commits, PRs, and productivity via Anthropic Admin API.",
    authType: "uses_anthropic",
    credentialLabel: "Uses Anthropic connection",
    availability: "available",
    capabilities: ["developer_activity", "users", "cost", "reports", "alerts"],
    dataCoverage: "full",
    comingSoon: false,
    defaultSyncFrequencyHours: 24,
    accentColor: "emerald",
  },
  {
    key: "github_copilot",
    displayName: "GitHub Copilot",
    shortName: "Copilot",
    category: "developer_ai",
    description: "Seat utilization, suggestion acceptance rates, and developer activity.",
    authType: "github_app_pat",
    credentialLabel: "GitHub App or Personal Access Token",
    availability: "available",
    capabilities: ["developer_activity", "users", "seat_usage", "reports", "alerts"],
    dataCoverage: "seat_based",
    comingSoon: false,
    defaultSyncFrequencyHours: 24,
    accentColor: "indigo",
  },
  {
    key: "cursor",
    displayName: "Cursor",
    shortName: "Cursor",
    category: "developer_ai",
    description: "Cursor IDE AI usage, seat tracking, and model-level activity.",
    authType: "api_key",
    credentialLabel: "Admin API Key / CSV Import",
    availability: "available",
    capabilities: ["developer_activity", "users", "seat_usage", "models", "estimated_cost", "reports", "alerts"],
    dataCoverage: "partial",
    comingSoon: false,
    defaultSyncFrequencyHours: 24,
    accentColor: "amber",
  },
  // Business Productivity AI
  {
    key: "microsoft_copilot",
    displayName: "Microsoft Copilot",
    shortName: "MS Copilot",
    category: "business_ai",
    description: "Microsoft 365 Copilot adoption, seat utilization, and per-app activity via Microsoft Graph.",
    authType: "microsoft_graph",
    credentialLabel: "Microsoft Graph / Entra App Credentials",
    availability: "available",
    capabilities: ["users", "seat_usage", "business_app_usage", "reports", "alerts"],
    dataCoverage: "requires_enterprise",
    comingSoon: false,
    defaultSyncFrequencyHours: 48,
    accentColor: "blue",
  },
];

export const PROVIDER_MAP = Object.fromEntries(
  PROVIDERS.map(p => [p.key, p])
) as Record<ProviderKey, ProviderDefinition>;

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  api_spend:    "LLM / API Spend",
  developer_ai: "Developer AI Tools",
  business_ai:  "Business Productivity AI",
};

export const CATEGORY_BADGE: Record<ProviderCategory, string> = {
  api_spend:    "bg-emerald-500/10 text-emerald-400",
  developer_ai: "bg-cyan-500/10 text-cyan-400",
  business_ai:  "bg-indigo-500/10 text-indigo-400",
};

export const DATA_COVERAGE_BADGE: Record<DataCoverage, string> = {
  full:                    "bg-emerald-500/10 text-emerald-400",
  partial:                 "bg-amber-500/10 text-amber-400",
  estimated:               "bg-amber-500/10 text-amber-400",
  seat_based:              "bg-cyan-500/10 text-cyan-400",
  manual_mapping_required: "bg-white/5 text-white/40",
  csv_import_only:         "bg-white/5 text-white/40",
  requires_enterprise:     "bg-indigo-500/10 text-indigo-400",
  coming_soon:             "bg-white/5 text-white/30",
};

export function providersByCategory(cat: ProviderCategory): ProviderDefinition[] {
  return PROVIDERS.filter(p => p.category === cat);
}

export function getAllProviders(): ProviderDefinition[] {
  return PROVIDERS;
}

// Alias for code that imports PROVIDER_REGISTRY (map keyed by provider key)
export const PROVIDER_REGISTRY = PROVIDER_MAP;

