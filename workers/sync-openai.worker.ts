import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { getProviderCredential, markProviderFailed, markProviderSynced } from "@/modules/providers/connector.interface";
import { fetchOpenAIUsage } from "@/modules/providers/openai/connector";
import { startSyncRun, completeSyncRun, failSyncRun } from "./sync-run-logger";

// OpenAI published pricing (USD per 1M tokens) as of mid-2026
// Used as fallback when the cost API is unavailable.
const MODEL_PRICE: Record<string, { input: number; output: number; cached: number }> = {
  "gpt-4o":             { input: 2.50,  output: 10.00, cached: 1.25 },
  "gpt-4o-mini":        { input: 0.15,  output: 0.60,  cached: 0.075 },
  "gpt-4-turbo":        { input: 10.00, output: 30.00, cached: 5.00 },
  "gpt-4":              { input: 30.00, output: 60.00, cached: 15.00 },
  "gpt-3.5-turbo":      { input: 0.50,  output: 1.50,  cached: 0.25 },
  "o1":                 { input: 15.00, output: 60.00, cached: 7.50 },
  "o1-mini":            { input: 3.00,  output: 12.00, cached: 1.50 },
  "o3":                 { input: 10.00, output: 40.00, cached: 5.00 },
};

function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number
): number {
  const key = Object.keys(MODEL_PRICE).find(k => model.startsWith(k)) ?? "";
  const price = MODEL_PRICE[key];
  if (!price) return 0;
  return (
    (inputTokens  / 1_000_000) * price.input  +
    (outputTokens / 1_000_000) * price.output +
    (cachedTokens / 1_000_000) * price.cached
  );
}

/** Delete demo/seed rows for this provider before writing live data */
async function purgeDemoData(organizationId: string, provider: string) {
  await Promise.all([
    prisma.aiUsageDaily.deleteMany({ where: { organizationId, provider } }),
    prisma.aiModelUsageDaily.deleteMany({ where: { organizationId, provider } }),
  ]);
}

export async function syncOpenAI(
  organizationId: string
): Promise<{ synced: number; errors: string[] }> {
  const apiKey = await getProviderCredential(organizationId, "openai");
  if (!apiKey) return { synced: 0, errors: ["OpenAI not connected"] };

  const endDate   = new Date();
  const startDate = subDays(endDate, 7);
  const errors: string[] = [];
  const run = await startSyncRun(organizationId, "openai");

  try {
    // Clear demo/seed data before writing real API data
    await purgeDemoData(organizationId, "openai");

    const pages = await fetchOpenAIUsage(apiKey, startDate, endDate);
    let synced = 0;

    // Pre-aggregate model totals in memory: key = "model|dateISO"
    // The OpenAI API groups by user+model+project, so one sync run may have
    // many rows for the same model on the same date. We must SUM them before
    // upserting — writing row-by-row would overwrite with the last user's values.
    const modelAgg = new Map<string, {
      model: string; date: Date;
      inputTokens: number; outputTokens: number; totalTokens: number; totalCostUsd: number;
    }>();

    for (const page of pages) {
      const date = startOfDay(new Date(page.aggregation_timestamp * 1000));

      for (const r of page.results) {
        if (!r.user_id && !r.project_id) continue;

        const userEmail = r.user_id ?? `project:${r.project_id}`;
        const model     = r.model ?? "unknown";
        const cached    = r.input_cached_tokens ?? 0;
        const costUsd   = estimateCost(model, r.input_tokens, r.output_tokens, cached);
        const total     = r.input_tokens + r.output_tokens;

        // ── Per-user row ─────────────────────────────────────────────────────
        try {
          await prisma.aiUsageDaily.upsert({
            where: {
              organizationId_provider_date_userEmail: {
                organizationId, provider: "openai", date, userEmail,
              },
            },
            create: {
              organizationId, provider: "openai", date, userEmail,
              inputTokens: r.input_tokens, outputTokens: r.output_tokens,
              cachedTokens: cached, totalTokens: total,
              totalCostUsd: costUsd.toFixed(6),
            },
            update: {
              inputTokens: r.input_tokens, outputTokens: r.output_tokens,
              cachedTokens: cached, totalTokens: total,
              totalCostUsd: costUsd.toFixed(6),
            },
          });
          synced++;
        } catch (rowErr) {
          errors.push(`Row ${userEmail}/${date.toISOString()}: ${rowErr instanceof Error ? rowErr.message : rowErr}`);
        }

        // ── Accumulate model totals (do NOT upsert yet — sum all users first) ─
        const aggKey = `${model}|${date.toISOString()}`;
        const existing = modelAgg.get(aggKey);
        if (existing) {
          existing.inputTokens  += r.input_tokens;
          existing.outputTokens += r.output_tokens;
          existing.totalTokens  += total;
          existing.totalCostUsd += costUsd;
        } else {
          modelAgg.set(aggKey, { model, date, inputTokens: r.input_tokens, outputTokens: r.output_tokens, totalTokens: total, totalCostUsd: costUsd });
        }
      }
    }

    // ── Write aggregated model rows (one upsert per model+date) ─────────────
    for (const agg of modelAgg.values()) {
      try {
        await prisma.aiModelUsageDaily.upsert({
          where: {
            organizationId_provider_model_date: {
              organizationId, provider: "openai", model: agg.model, date: agg.date,
            },
          },
          create: {
            organizationId, provider: "openai", model: agg.model, date: agg.date,
            inputTokens: agg.inputTokens, outputTokens: agg.outputTokens,
            totalTokens: agg.totalTokens, totalCostUsd: agg.totalCostUsd.toFixed(6),
          },
          update: {
            inputTokens: agg.inputTokens, outputTokens: agg.outputTokens,
            totalTokens: agg.totalTokens, totalCostUsd: agg.totalCostUsd.toFixed(6),
          },
        });
      } catch (rowErr) {
        errors.push(`Model ${agg.model}/${agg.date.toISOString()}: ${rowErr instanceof Error ? rowErr.message : rowErr}`);
      }
    }

    await markProviderSynced(organizationId, "openai");
    await completeSyncRun(run.id, synced);
    return { synced, errors };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await markProviderFailed(organizationId, "openai", msg);
    await failSyncRun(run.id, err);
    return { synced: 0, errors: [msg] };
  }
}
