import { subDays, startOfDay, format } from "date-fns";

export function getDateRangeStart(days: number): Date {
  return startOfDay(subDays(new Date(), days - 1));
}

export function parseDays(searchParams: URLSearchParams, def = 30): number {
  const d = parseInt(searchParams.get("days") ?? "", 10);
  return [7, 30, 60, 90].includes(d) ? d : def;
}

export function fmtUsd(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export function maskKey(key: string | null | undefined): string {
  if (!key) return "";
  const start = key.substring(0, 18);
  const end = key.slice(-4);
  return `${start}...${end}`;
}

export function forecastMonthly(dailyRows: { date: Date | string; cost: number }[]): number {
  if (!dailyRows.length) return 0;
  const avg = dailyRows.reduce((s, r) => s + r.cost, 0) / dailyRows.length;
  return avg * 30;
}
