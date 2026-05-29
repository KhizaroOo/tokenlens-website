import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { AlertSeverity } from "@prisma/client";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "monthly") return startOfMonth(now);
  if (period === "weekly") return startOfWeek(now);
  return startOfDay(now);
}

export async function checkAlerts(organizationId: string): Promise<number> {
  const rules = await prisma.alertRule.findMany({
    where: { organizationId, enabled: true },
  });

  let triggered = 0;

  for (const rule of rules) {
    const since = getPeriodStart(rule.period);

    let actualValue = 0;

    if (rule.metric === "org_monthly_cost" || rule.metric === "org_cost") {
      const agg = await prisma.usageDaily.aggregate({
        where: { organizationId, date: { gte: since } },
        _sum: { totalCostUsd: true },
      });
      actualValue = Number(agg._sum.totalCostUsd ?? 0);
    } else if (rule.metric === "user_daily_cost") {
      const grouped = await prisma.usageDaily.groupBy({
        by: ["userEmail"],
        where: { organizationId, date: { gte: since } },
        _sum: { totalCostUsd: true },
      });
      actualValue = Math.max(...grouped.map((g) => Number(g._sum.totalCostUsd ?? 0)), 0);
    } else if (rule.metric === "team_monthly_cost") {
      const grouped = await prisma.usageDaily.groupBy({
        by: ["teamId"],
        where: { organizationId, date: { gte: since } },
        _sum: { totalCostUsd: true },
      });
      actualValue = Math.max(...grouped.map((g) => Number(g._sum.totalCostUsd ?? 0)), 0);
    }

    const threshold = Number(rule.threshold);
    const breached =
      rule.operator === "gt"
        ? actualValue > threshold
        : rule.operator === "gte"
        ? actualValue >= threshold
        : actualValue < threshold;

    if (!breached) continue;

    // Don't re-fire if already alerted in this period
    const existing = await prisma.alert.findFirst({
      where: {
        organizationId,
        alertRuleId: rule.id,
        createdAt: { gte: since },
        resolvedAt: null,
      },
    });
    if (existing) continue;

    const severity: AlertSeverity =
      actualValue > threshold * 1.2 ? AlertSeverity.critical : AlertSeverity.warning;

    await prisma.alert.create({
      data: {
        organizationId,
        alertRuleId: rule.id,
        message: `[${rule.name}] ${rule.metric} reached $${actualValue.toFixed(2)} (threshold: $${threshold})`,
        severity,
      },
    });
    triggered++;
  }

  return triggered;
}
