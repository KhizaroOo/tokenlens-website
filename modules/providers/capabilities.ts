import type { ProviderKey } from "./registry";
import { PROVIDER_REGISTRY } from "./registry";

/** Returns true if the provider tracks token/cost data */
export function isTokenBased(key: ProviderKey): boolean {
  const p = PROVIDER_REGISTRY[key];
  return p.capabilities.includes("tokens") || p.capabilities.includes("cost");
}

/** Returns true if the provider has seat-based licensing */
export function isSeatBased(key: ProviderKey): boolean {
  return PROVIDER_REGISTRY[key].capabilities.includes("seat_usage");
}

/** Returns true if the provider tracks developer activity events */
export function isActivityBased(key: ProviderKey): boolean {
  return PROVIDER_REGISTRY[key].capabilities.includes("developer_activity");
}

/**
 * Returns true if a real API connector exists for this provider.
 * Explicitly returns false for limited providers (Gemini, Perplexity)
 * which have no admin API regardless of their availability value.
 */
export function hasRealConnector(key: ProviderKey): boolean {
  const p = PROVIDER_REGISTRY[key];
  return p.availability === "available" && !p.limited;
}

/** Returns category label for display */
export function categoryLabel(category: string): string {
  switch (category) {
    case "api_spend":    return "LLM/API Spend Providers";
    case "developer_ai": return "Developer AI Tools";
    case "business_ai":  return "Business Productivity AI";
    default:             return category;
  }
}
