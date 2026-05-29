import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ruleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  metric: z.string().min(1),
  threshold: z.number().positive(),
  operator: z.enum(["gt", "gte", "lt", "lte"]).default("gt"),
  period: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
  enabled: z.boolean().default(true),
});

const schema = z.object({ rules: z.array(ruleSchema) });

export async function PUT(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { organizationId } = session;

  // Upsert each rule
  for (const rule of parsed.data.rules) {
    if (rule.id) {
      await prisma.alertRule.updateMany({
        where: { id: rule.id, organizationId },
        data: { enabled: rule.enabled, threshold: rule.threshold, name: rule.name },
      });
    } else {
      await prisma.alertRule.create({
        data: { organizationId, name: rule.name, metric: rule.metric, threshold: rule.threshold, operator: rule.operator, period: rule.period, enabled: rule.enabled },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
