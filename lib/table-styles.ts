/** Shared Tailwind classes for tables across the app */
export const TH = "px-5 py-3.5 text-left text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground";
export const TR = "border-b border-border transition-colors hover:bg-muted/40";
export const TD = "px-5 py-3.5 text-sm";
export const TD_MONO = "px-5 py-3.5 text-sm font-data tabular-nums";
export const TEAM_PILL = "inline-flex rounded-lg bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground";

/** Recharts adaptive tooltip config */
export const CHART_TOOLTIP = {
  contentStyle: {
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    color: "var(--foreground)",
    fontSize: "12px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  labelStyle: { color: "var(--foreground)", fontWeight: 700 },
  itemStyle: { color: "var(--muted-foreground)" },
  cursor: { fill: "rgba(16,185,129,0.05)" },
};

export const CHART_COLORS = {
  emerald: "#10b981",
  cyan:    "#06b6d4",
  indigo:  "#818cf8",
  amber:   "#fbbf24",
  red:     "#f87171",
};
