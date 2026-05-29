import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STALE_RUNNING_MS = 30 * 60 * 1000; // 30 minutes
const MAX_LIMIT        = 100;
const DEFAULT_LIMIT    = 50;

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireSession();

    const { searchParams } = new URL(request.url);

    // Optional provider filter
    const providerParam = searchParams.get("provider");
    const provider = providerParam && providerParam.trim() !== "" ? providerParam.trim() : undefined;

    // Optional limit with safe cap
    const limitRaw = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
    const limit    = isNaN(limitRaw) || limitRaw < 1 ? DEFAULT_LIMIT : Math.min(limitRaw, MAX_LIMIT);

    const rows = await prisma.providerSyncRun.findMany({
      where: {
        organizationId,                        // always scoped
        ...(provider ? { provider } : {}),
      },
      orderBy: { startedAt: "desc" },
      take:    limit,
      select: {
        id:            true,
        provider:      true,
        status:        true,
        recordsSynced: true,
        errorMessage:  true,
        startedAt:     true,
        finishedAt:    true,
        // organizationId intentionally omitted — not needed by client
      },
    });

    const now = Date.now();

    const runs = rows.map(row => {
      // Calculate durationMs from stored timestamps
      const startMs  = new Date(row.startedAt).getTime();
      const finishMs = row.finishedAt ? new Date(row.finishedAt).getTime() : null;
      const durationMs = finishMs != null
        ? finishMs - startMs
        : row.status === "running"
          ? now - startMs       // elapsed for still-running
          : null;

      // Stale detection: running for > 30 minutes
      const isStale = row.status === "running" && (now - startMs) > STALE_RUNNING_MS;

      return {
        id:            row.id,
        provider:      row.provider,
        status:        isStale ? "stale" : row.status,
        recordsSynced: row.recordsSynced,
        errorMessage:  row.errorMessage ?? null,
        startedAt:     row.startedAt.toISOString(),
        finishedAt:    row.finishedAt?.toISOString() ?? null,
        durationMs,
        isStale,
      };
    });

    return NextResponse.json({ runs, total: runs.length });

  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[/api/providers/sync-runs]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
