/** Format a cost number with $ prefix */
export function fmtCost(n: number): string {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format token count with K/M suffix */
export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

/** Format acceptance rate as percentage */
export function fmtPct(numerator: number, denominator: number): string {
  if (!denominator) return "0%";
  return ((numerator / denominator) * 100).toFixed(1) + "%";
}

/** "YYYY-MM-DD" → "May 11" */
export function fmtDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
