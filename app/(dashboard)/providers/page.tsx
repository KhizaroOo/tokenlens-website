"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCardSkeleton } from "@/components/dashboard/StatCardSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Layers, DollarSign, Zap, Users, Server } from "lucide-react";
import type { ProviderSummary, ProviderCategory } from "@/modules/providers/types";
import { categoryLabel } from "@/modules/providers/capabilities";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtUsd(n: number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

const CATEGORY_ORDER: ProviderCategory[] = ["api_spend", "developer_ai", "business_ai"];

const CATEGORY_COLORS: Record<ProviderCategory, string> = {
  api_spend:    "border-emerald-500/30 bg-emerald-500/5",
  developer_ai: "border-cyan-500/30 bg-cyan-500/5",
  business_ai:  "border-blue-500/30 bg-blue-500/5",
};

const CATEGORY_BADGE: Record<ProviderCategory, string> = {
  api_spend:    "bg-emerald-500/20 text-emerald-400",
  developer_ai: "bg-cyan-500/20 text-cyan-400",
  business_ai:  "bg-blue-500/20 text-blue-400",
};

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({ p }: { p: ProviderSummary }) {
  return (
    <div className={`rounded-lg border p-5 flex flex-col gap-4 ${CATEGORY_COLORS[p.category]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{p.label}</p>
          <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_BADGE[p.category]}`}>
            {categoryLabel(p.category)}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === "connected" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
          {p.status === "connected" ? "Live" : "Not connected"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {p.totalTokens > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Tokens</p>
            <p className="text-lg font-bold text-foreground font-data">{fmtTokens(p.totalTokens)}</p>
          </div>
        )}
        {p.activeSeats > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Active Seats</p>
            <p className="text-lg font-bold text-foreground font-data">{p.activeSeats}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Cost (30d)</p>
          <p className="text-lg font-bold text-foreground font-data">{fmtUsd(p.totalCostUsd)}</p>
        </div>
        {p.activeUsers > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-lg font-bold text-foreground font-data">{p.activeUsers}</p>
          </div>
        )}
      </div>

      {p.lastSyncAt && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          Last sync: {new Date(p.lastSyncAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setProviders(d.providers ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalCost   = providers.reduce((s, p) => s + p.totalCostUsd, 0);
  const totalTokens = providers.reduce((s, p) => s + p.totalTokens,  0);
  const liveCount   = providers.filter((p) => p.status === "connected").length;

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: providers.filter((p) => p.category === cat),
  }));

  return (
    <PageShell title="Providers" subtitle="Multi-provider AI intelligence hub — all your AI spend in one place">
      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-emerald-500/10"><Layers className="h-4 w-4 text-emerald-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Providers</p>
                  <p className="text-xl font-bold text-foreground font-data">{providers.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-cyan-500/10"><Server className="h-4 w-4 text-cyan-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Live Connections</p>
                  <p className="text-xl font-bold text-foreground font-data">{liveCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-amber-500/10"><DollarSign className="h-4 w-4 text-amber-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Cost (30d)</p>
                  <p className="text-xl font-bold text-foreground font-data">{fmtUsd(totalCost)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-indigo-500/10"><Zap className="h-4 w-4 text-indigo-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Tokens (30d)</p>
                  <p className="text-xl font-bold text-foreground font-data">{fmtTokens(totalTokens)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Category Sections ── */}
      {error ? (
        <EmptyState icon={Layers} title="Failed to load providers" description={error} />
      ) : (
        byCategory.map(({ cat, items }) => (
          <SectionCard
            key={cat}
            title={categoryLabel(cat)}
            subtitle={`${items.length} provider${items.length !== 1 ? "s" : ""}`}
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: cat === "api_spend" ? 4 : cat === "developer_ai" ? 3 : 1 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState icon={Users} title="No providers" description="No data found for this category." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((p) => <ProviderCard key={p.provider} p={p} />)}
              </div>
            )}
          </SectionCard>
        ))
      )}

    </PageShell>
  );
}
