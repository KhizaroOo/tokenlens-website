export const APP_NAME = "TokenLens";
export const APP_VERSION = "1.0.0";

export const COOKIE_NAME = "tl_session";
export const SESSION_EXPIRY_DAYS = 7;

export const SYNC_LOOKBACK_DAYS = 7;

export const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "claude-opus-4":      { inputPer1M: 15.0,  outputPer1M: 75.0  },
  "claude-sonnet-4":    { inputPer1M: 3.0,   outputPer1M: 15.0  },
  "claude-haiku-4-5":   { inputPer1M: 0.8,   outputPer1M: 4.0   },
  "claude-opus-4-5":    { inputPer1M: 15.0,  outputPer1M: 75.0  },
  "claude-sonnet-4-5":  { inputPer1M: 3.0,   outputPer1M: 15.0  },
};

export const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",   icon: "LayoutDashboard" },
  { label: "Users",       href: "/ai-users",       icon: "Users" },
  { label: "Teams",       href: "/ai-teams",       icon: "UsersRound" },
  { label: "Models",      href: "/ai-models",      icon: "Cpu" },
  { label: "Claude Code", href: "/claude-code", icon: "Terminal" },
  { label: "Alerts",      href: "/alerts",      icon: "Bell" },
  { label: "Reports",     href: "/reports",     icon: "FileBarChart" },
  { label: "Settings",    href: "/settings",    icon: "Settings" },
] as const;
