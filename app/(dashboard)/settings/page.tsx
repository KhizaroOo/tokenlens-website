"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/dashboard/PageShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, Shield, Eye, EyeOff, Loader2, CheckCircle,
  AlertCircle, AlertTriangle, DollarSign, Bell, ToggleLeft, ToggleRight,
  X, Settings2, History, Clock, CheckCheck, XCircle, AlertOctagon,
} from "lucide-react";
import { TH, TR, TD, TD_MONO } from "@/lib/table-styles";
import type { ProviderStatus } from "@/types/claude";
import {
  PROVIDERS, CATEGORY_LABELS, CATEGORY_BADGE, DATA_COVERAGE_BADGE, providersByCategory,
  type ProviderKey, type ProviderCategory, type ProviderDefinition,
} from "@/modules/providers/registry";

// ── Styles ────────────────────────────────────────────────────────────────────

const INPUT_CLS  = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
const INPUT_RO   = "w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground cursor-not-allowed";
const LABEL_CLS  = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";

// ── Types ─────────────────────────────────────────────────────────────────────

type AlertRule = {
  id: string; name: string; description: string | null;
  metric: string; threshold: number; enabled: boolean; severity: string;
};

type SettingsData = {
  organization: { name: string; adminEmail: string };
  budget: { monthlyBudget: number | null };
  provider: ProviderStatus | null;
  alertRules: AlertRule[];
  lastClaudeCodeSyncedAt?: string | null;
};

// ── Sync-run types & helpers ──────────────────────────────────────────────────

type SyncRun = {
  id:            string;
  provider:      string;
  status:        "running" | "success" | "failed" | "stale" | string;
  recordsSynced: number;
  errorMessage:  string | null;
  startedAt:     string;
  finishedAt:    string | null;
  durationMs:    number | null;
  isStale:       boolean;
};

const PROVIDER_DISPLAY: Record<string, string> = {
  anthropic:          "Anthropic Claude",
  claude_code:        "Claude Code",
  openai:             "OpenAI",
  github_copilot:     "GitHub Copilot",
  cursor:             "Cursor",
  microsoft_copilot:  "Microsoft Copilot",
};

function fmtDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60_000);
  const secs = Math.round((ms % 60_000) / 1000);
  return `${mins}m ${secs}s`;
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)         return "just now";
  if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)     return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function SyncRunStatusBadge({ status }: { status: string }) {
  if (status === "success") return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
      <CheckCheck className="h-3 w-3" /> Success
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400">
      <XCircle className="h-3 w-3" /> Failed
    </span>
  );
  if (status === "stale") return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400">
      <AlertOctagon className="h-3 w-3" /> Stale
    </span>
  );
  if (status === "running") return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400">
      <Loader2 className="h-3 w-3 animate-spin" /> Running
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400">
      Unknown
    </span>
  );
}

// ── Inline message ────────────────────────────────────────────────────────────

function InlineMsg({ msg }: { msg: { type: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm border ${
      msg.type === "ok"
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        : "bg-red-500/10 border-red-500/20 text-red-400"
    }`}>
      {msg.type === "ok" ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
      {msg.text}
    </div>
  );
}

// ── Configure Modal ───────────────────────────────────────────────────────────

/** Providers that accept a single API key */
const SINGLE_KEY_PROVIDERS = new Set(["anthropic", "openai", "cursor"]);
/** Providers that require GitHub org + PAT */
const GITHUB_PROVIDERS = new Set(["github_copilot"]);
/** Providers that require Entra app credentials */
const MICROSOFT_PROVIDERS = new Set(["microsoft_copilot"]);
/** Providers not yet integratable */
const LIMITED_PROVIDERS = new Set(["gemini", "perplexity"]);

function ConfigureModal({
  prov,
  isConnected,
  onConnect,
  onDisconnect,
  onClose,
  saving,
}: {
  prov: ProviderDefinition;
  isConnected: boolean;
  onConnect: (credential: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  // Single-key fields
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  // GitHub fields
  const [ghOrg, setGhOrg]   = useState("");
  const [ghPat, setGhPat]   = useState("");
  // Microsoft fields
  const [msTenant, setMsTenant]     = useState("");
  const [msClientId, setMsClientId] = useState("");
  const [msSecret, setMsSecret]     = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    let credential = "";

    if (SINGLE_KEY_PROVIDERS.has(prov.key)) {
      if (!apiKey.trim()) return;
      credential = apiKey.trim();
    } else if (GITHUB_PROVIDERS.has(prov.key)) {
      if (!ghOrg.trim() || !ghPat.trim()) return;
      credential = JSON.stringify({ org: ghOrg.trim(), token: ghPat.trim() });
    } else if (MICROSOFT_PROVIDERS.has(prov.key)) {
      if (!msTenant.trim() || !msClientId.trim() || !msSecret.trim()) return;
      credential = JSON.stringify({ tenantId: msTenant.trim(), clientId: msClientId.trim(), clientSecret: msSecret.trim() });
    } else {
      return;
    }

    try {
      await onConnect(credential);
      setMsg({ type: "ok", text: "Connected successfully." });
      setApiKey(""); setGhOrg(""); setGhPat(""); setMsTenant(""); setMsClientId(""); setMsSecret("");
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Connection failed. Check your credentials." });
    }
  }

  async function handleDisconnect() {
    setMsg(null);
    await onDisconnect();
    setMsg({ type: "ok", text: "Disconnected." });
  }

  const isClaude  = prov.key === "claude_code";
  const isLimited = LIMITED_PROVIDERS.has(prov.key);
  const canConnect = !isClaude && !isLimited && !isConnected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${CATEGORY_BADGE[prov.category]}`}>
                {CATEGORY_LABELS[prov.category]}
              </span>
              {isConnected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400">
                  connected
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-foreground">{prov.displayName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{prov.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {msg && <InlineMsg msg={msg} />}

          {/* Data coverage */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Data coverage:</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${DATA_COVERAGE_BADGE[prov.dataCoverage]}`}>
              {prov.dataCoverage.replace(/_/g, " ")}
            </span>
          </div>

          {/* Claude Code — uses Anthropic */}
          {isClaude && (
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs text-muted-foreground">
              Claude Code uses your Anthropic Admin API connection. No separate credential required.
            </div>
          )}

          {/* Limited providers */}
          {isLimited && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5">
              <p className="text-xs font-semibold text-amber-400">No programmatic API available</p>
              <p className="text-xs text-muted-foreground">
                {prov.key === "gemini"
                  ? "Gemini has no aggregate usage/billing REST API. Cost data requires Google Cloud Billing Export to BigQuery. See Provider Limitations for details."
                  : "Perplexity has no admin usage/billing REST API. Data requires Enterprise webhook audit logs (50+ seats). See Provider Limitations for details."}
              </p>
            </div>
          )}

          {/* Single API key form */}
          {canConnect && SINGLE_KEY_PROVIDERS.has(prov.key) && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={LABEL_CLS}>{prov.credentialLabel}</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={
                      prov.key === "anthropic" ? "sk-ant-admin-..." :
                      prov.key === "cursor"    ? "Enter Cursor admin API key…" :
                      "Enter admin API key…"
                    }
                    className={INPUT_CLS + " pr-9"}
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {prov.key === "anthropic" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get your Admin API key at{" "}
                    <a href="https://console.anthropic.com/settings/admin-keys" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                      console.anthropic.com → Admin Keys
                    </a>
                  </p>
                )}
                {prov.key === "openai" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get your Admin API key at{" "}
                    <a href="https://platform.openai.com/settings/organization/admin-keys" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                      platform.openai.com → Organization → Admin Keys
                    </a>
                  </p>
                )}
                {prov.key === "cursor" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get your Admin API key at{" "}
                    <a href="https://www.cursor.com/settings" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                      cursor.com → Settings → Admin API Key
                    </a>
                  </p>
                )}
              </div>
              <Button type="submit" size="sm" disabled={saving || !apiKey.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Connecting…</> : "Connect & Verify"}
              </Button>
            </form>
          )}

          {/* GitHub Copilot form */}
          {canConnect && GITHUB_PROVIDERS.has(prov.key) && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={LABEL_CLS}>GitHub Organization Name</label>
                <input type="text" value={ghOrg} onChange={e => setGhOrg(e.target.value)}
                  placeholder="my-org" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Personal Access Token</label>
                <div className="relative">
                  <input type={showKey ? "text" : "password"} value={ghPat}
                    onChange={e => setGhPat(e.target.value)}
                    placeholder="ghp_..." className={INPUT_CLS + " pr-9"} />
                  <button type="button" onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Required scope: <code className="bg-muted px-1 rounded">manage_billing:copilot</code> — generate at{" "}
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                    github.com/settings/tokens
                  </a>
                </p>
              </div>
              <Button type="submit" size="sm" disabled={saving || !ghOrg.trim() || !ghPat.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Connecting…</> : "Connect & Verify"}
              </Button>
            </form>
          )}

          {/* Microsoft Copilot form */}
          {canConnect && MICROSOFT_PROVIDERS.has(prov.key) && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={LABEL_CLS}>Tenant ID</label>
                <input type="text" value={msTenant} onChange={e => setMsTenant(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Client (Application) ID</label>
                <input type="text" value={msClientId} onChange={e => setMsClientId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Client Secret</label>
                <div className="relative">
                  <input type={showSecret ? "text" : "password"} value={msSecret}
                    onChange={e => setMsSecret(e.target.value)}
                    placeholder="Enter client secret…" className={INPUT_CLS + " pr-9"} />
                  <button type="button" onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  App registration requires <code className="bg-muted px-1 rounded">Reports.Read.All</code> application permission with admin consent.{" "}
                  <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                    Create app registration in Azure Portal
                  </a>
                </p>
              </div>
              <Button type="submit" size="sm" disabled={saving || !msTenant.trim() || !msClientId.trim() || !msSecret.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Connecting…</> : "Connect & Verify"}
              </Button>
            </form>
          )}

          {/* Disconnect */}
          {isConnected && !isClaude && (
            <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={saving}
              className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disconnect"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings]         = useState<SettingsData | null>(null);
  const [loadingSettings, setLoading]   = useState(true);
  const [userRole, setUserRole]         = useState<string>("viewer");
  const [providerStatus, setProvStatus]       = useState<ProviderStatus | null>(null);
  const [provConnections, setProvConnections] = useState<Record<string, string>>({}); // key → status

  // Configure modal
  const [configProv, setConfigProv] = useState<ProviderDefinition | null>(null);
  const [savingProv, setSavingProv] = useState(false);

  // Org
  const [orgName, setOrgName]   = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMsg, setOrgMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Budget
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [savingBudget, setSavingBudget]   = useState(false);
  const [budgetMsg, setBudgetMsg]         = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Alert rules
  const [alertRules, setAlertRules]     = useState<AlertRule[]>([]);
  const [togglingRule, setTogglingRule] = useState<string | null>(null);

  // Sync
  const [syncing, setSyncing]   = useState<string | null>(null); // providerKey or "all"
  const [syncMsg, setSyncMsg]   = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Sync run history
  const [syncRuns, setSyncRuns]         = useState<SyncRun[]>([]);
  const [loadingSyncRuns, setLoadingSyncRuns] = useState(true);
  const [syncRunsErr, setSyncRunsErr]   = useState(false);

  const isViewer  = userRole === "viewer";
  const connected = providerStatus?.status === "connected";

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => { if (d.user?.role) setUserRole(d.user.role); })
      .catch(() => {});

    fetch("/api/settings")
      .then(r => r.json())
      .then((d: SettingsData) => {
        setSettings(d);
        setOrgName(d.organization?.name ?? "");
        setOrgEmail(d.organization?.adminEmail ?? "");
        setMonthlyBudget(d.budget?.monthlyBudget != null ? String(d.budget.monthlyBudget) : "");
        setAlertRules(d.alertRules ?? []);
        setProvStatus(d.provider);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch all provider connection statuses for sync gating
    fetch("/api/providers")
      .then(r => r.json())
      .then(d => {
        const map: Record<string, string> = {};
        for (const p of d.providers ?? []) map[p.provider] = p.status;
        setProvConnections(map);
      })
      .catch(() => {});

    // Fetch recent sync runs for history table
    fetch("/api/providers/sync-runs?limit=50")
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(d => setSyncRuns(d.runs ?? []))
      .catch(() => setSyncRunsErr(true))
      .finally(() => setLoadingSyncRuns(false));
  }, []);

  // ── Provider connect / disconnect ──────────────────────────────────────────

  async function handleConnect(credential: string) {
    if (!configProv) return;
    setSavingProv(true);
    try {
      const provKey = configProv.key;
      // Anthropic uses the legacy route; all others use the generic route
      const endpoint = provKey === "anthropic" ? "/api/provider" : `/api/providers/${provKey}`;
      const body = provKey === "anthropic"
        ? JSON.stringify({ apiKey: credential })
        : JSON.stringify({ credential });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Connect failed");

      // Refresh connection statuses
      if (provKey === "anthropic") {
        const updated = await fetch("/api/provider").then(r => r.json());
        setProvStatus(updated);
      }
      // Refresh all provider statuses so sync buttons update
      fetch("/api/providers").then(r => r.json()).then(d => {
        const map: Record<string, string> = {};
        for (const p of d.providers ?? []) map[p.provider] = p.status;
        setProvConnections(map);
      }).catch(() => {});
    } finally {
      setSavingProv(false);
    }
  }

  async function handleDisconnect() {
    if (!configProv) return;
    setSavingProv(true);
    try {
      const provKey = configProv.key;
      const endpoint = provKey === "anthropic" ? "/api/provider" : `/api/providers/${provKey}`;
      await fetch(endpoint, { method: "DELETE" });
      if (provKey === "anthropic") {
        const updated = await fetch("/api/provider").then(r => r.json());
        setProvStatus(updated);
      }
      fetch("/api/providers").then(r => r.json()).then(d => {
        const map: Record<string, string> = {};
        for (const p of d.providers ?? []) map[p.provider] = p.status;
        setProvConnections(map);
      }).catch(() => {});
    } finally {
      setSavingProv(false);
    }
  }

  // ── Sync ──────────────────────────────────────────────────────────────────

  async function handleSyncAll() {
    setSyncing("all");
    setSyncMsg(null);
    try {
      const res  = await fetch("/api/provider/sync-all", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const total    = (data.usageSynced ?? 0) + (data.claudeCodeSynced ?? 0);
        const newUsers = data.newUsersCreated ? ` · ${data.newUsersCreated} new user(s) discovered.` : "";
        const warn     = data.errors?.length ? ` (warnings: ${data.errors.join("; ")})` : "";
        setSyncMsg({ type: "ok", text: `Sync complete — ${total} records updated.${newUsers}${warn}` });
        const updated = await fetch("/api/provider").then(r => r.json());
        setProvStatus(updated);
      } else {
        setSyncMsg({ type: "err", text: data.error ?? "Sync failed." });
      }
    } finally {
      setSyncing(null);
    }
  }

  async function handleProviderSync(provKey: ProviderKey) {
    setSyncing(provKey);
    setSyncMsg(null);
    try {
      const res  = await fetch(`/api/providers/${provKey}/sync`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const warnings = (data.errors ?? []).length ? ` (${data.errors.join("; ")})` : "";
        setSyncMsg({ type: "ok", text: `Synced ${data.synced ?? 0} records for ${provKey}.${warnings}` });
      } else {
        setSyncMsg({ type: "err", text: data.error ?? "Sync failed." });
      }
    } finally {
      setSyncing(null);
      // Refresh sync run history after sync
      fetch("/api/providers/sync-runs?limit=50")
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setSyncRuns(d.runs ?? []))
        .catch(() => {});
    }
  }

  // ── Org / Budget / Alert rules ─────────────────────────────────────────────

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault();
    setSavingOrg(true); setOrgMsg(null);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, adminEmail: orgEmail }),
      });
      const d = await res.json();
      setOrgMsg(res.ok ? { type: "ok", text: "Organization settings saved." } : { type: "err", text: d.error ?? "Save failed." });
    } finally { setSavingOrg(false); }
  }

  async function handleSaveBudget(e: React.FormEvent) {
    e.preventDefault();
    setSavingBudget(true); setBudgetMsg(null);
    try {
      const budget = monthlyBudget.trim() === "" ? null : parseFloat(monthlyBudget);
      const res = await fetch("/api/settings/budget", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyBudget: budget }),
      });
      const d = await res.json();
      setBudgetMsg(res.ok ? { type: "ok", text: "Budget settings saved." } : { type: "err", text: d.error ?? "Save failed." });
    } finally { setSavingBudget(false); }
  }

  async function handleToggleRule(rule: AlertRule) {
    setTogglingRule(rule.id);
    try {
      const res = await fetch("/api/settings/alert-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, enabled: !rule.enabled }),
      });
      if (res.ok) setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
    } finally { setTogglingRule(null); }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageShell title="Settings" subtitle="Manage your TokenLens configuration">

      {/* 1 — Organization */}
      <SectionCard title="Organization" subtitle="General organization settings">
        {loadingSettings ? (
          <div className="space-y-4 max-w-md">
            <div className="h-10 rounded-xl bg-muted animate-pulse" />
            <div className="h-10 rounded-xl bg-muted animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSaveOrg} className="space-y-4 max-w-md">
            {orgMsg && <InlineMsg msg={orgMsg} />}
            <div>
              <label className={LABEL_CLS}>Organization Name</label>
              {isViewer
                ? <input type="text" value={orgName} readOnly className={INPUT_RO} />
                : <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className={INPUT_CLS} />}
            </div>
            <div>
              <label className={LABEL_CLS}>Admin Email</label>
              {isViewer
                ? <input type="email" value={orgEmail} readOnly className={INPUT_RO} />
                : <input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} className={INPUT_CLS} />}
            </div>
            {!isViewer && (
              <Button type="submit" size="sm" disabled={savingOrg}
                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5">
                {savingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            )}
          </form>
        )}
      </SectionCard>

      {/* 2 — Budget */}
      <SectionCard title="Budget" subtitle="Set a monthly spend limit for your organization">
        {loadingSettings ? (
          <div className="h-10 rounded-xl bg-muted animate-pulse max-w-md" />
        ) : (
          <form onSubmit={handleSaveBudget} className="space-y-4 max-w-md">
            {budgetMsg && <InlineMsg msg={budgetMsg} />}
            <div>
              <label className={LABEL_CLS}>Monthly Budget (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {isViewer
                  ? <input type="text" value={monthlyBudget || "Not set"} readOnly className={INPUT_RO + " pl-9"} />
                  : <input type="number" min="0" step="0.01" value={monthlyBudget}
                      onChange={e => setMonthlyBudget(e.target.value)}
                      placeholder="e.g. 500.00 — leave blank for no limit"
                      className={INPUT_CLS + " pl-9"} />}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Leave blank to remove the budget limit.</p>
            </div>
            {!isViewer && (
              <Button type="submit" size="sm" disabled={savingBudget}
                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5">
                {savingBudget ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Budget"}
              </Button>
            )}
          </form>
        )}
      </SectionCard>

      {/* 3 — Alert Rules */}
      <SectionCard title="Alert Rules" subtitle="Manage automated alerts for spend and usage thresholds">
        {loadingSettings ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : alertRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">No alert rules</p>
            <p className="text-xs text-muted-foreground mt-1">No alert rules have been configured yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{rule.name}</p>
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      rule.severity === "critical" ? "bg-red-500/10 text-red-400" :
                      rule.severity === "warning"  ? "bg-amber-500/10 text-amber-400" :
                                                     "bg-blue-500/10 text-blue-400"
                    }`}>{rule.severity}</span>
                  </div>
                  {rule.description && <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>}
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{rule.metric} · threshold: {rule.threshold}</p>
                </div>
                <button
                  disabled={isViewer || togglingRule === rule.id}
                  onClick={() => handleToggleRule(rule)}
                  className="flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  title={rule.enabled ? "Disable rule" : "Enable rule"}
                >
                  {togglingRule === rule.id
                    ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    : rule.enabled
                    ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                    : <ToggleLeft  className="h-6 w-6 text-muted-foreground" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 4 — Provider Integrations */}
      <SectionCard
        title="Provider Integrations"
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-400">
              Live
            </span>
            <span>Anthropic + Claude Code</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-cyan-500/15 text-cyan-400">
              Demo
            </span>
            <span>OpenAI, Copilot, Cursor, M365</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-amber-500/15 text-amber-400">
              Limited
            </span>
            <span>Gemini, Perplexity</span>
            <a
              href="https://github.com/KhizaroOo/tokenlens-idea/blob/main/docs/PROVIDER_SETUP_GUIDE.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors text-xs ml-auto"
            >
              <Settings2 className="h-3 w-3" />
              Setup Guide
            </a>
          </span>
        }
      >
        <div className="space-y-6">
          {(["api_spend", "developer_ai", "business_ai"] as ProviderCategory[]).map(cat => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CATEGORY_BADGE[cat]}`}>
                  {CATEGORY_LABELS[cat]}
                </span>
              </div>
              <div className="space-y-2">
                {providersByCategory(cat).map(prov => {
                  const isAnthropicKey = prov.key === "anthropic";
                  const isCC           = prov.key === "claude_code";
                  const isConn         = isAnthropicKey || isCC
                    ? connected
                    : provConnections[prov.key] === "connected";

                  return (
                    <div key={prov.key}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-foreground">{prov.displayName}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${DATA_COVERAGE_BADGE[prov.dataCoverage]}`}>
                            {prov.dataCoverage.replace(/_/g, " ")}
                          </span>
                          {isConn && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400">
                              connected
                            </span>
                          )}
                          {!isConn && prov.availability === "available" && (prov.key === "gemini" || prov.key === "perplexity") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400">
                              limited
                            </span>
                          )}
                          {!isConn && prov.availability === "available" && prov.key !== "gemini" && prov.key !== "perplexity" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-500/10 text-slate-400">
                              not connected
                            </span>
                          )}
                          {prov.availability === "coming_soon" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-white/5 text-white/30">
                              coming soon
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{prov.credentialLabel}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {isCC ? (
                          <span className="text-xs text-muted-foreground">Uses Anthropic</span>
                        ) : (prov.key === "gemini" || prov.key === "perplexity") ? (
                          <Link href="/limitations">
                            <span className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer inline-flex items-center gap-1.5">
                              <AlertTriangle className="h-3 w-3" />
                              View Limitations
                            </span>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isViewer}
                            onClick={() => setConfigProv(prov)}
                            className="text-xs gap-1.5"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                            Configure
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5 — Data Sync */}
      <SectionCard title="Data Sync" subtitle="Pull the latest data from all configured providers">
        {syncMsg && <div className="mb-5"><InlineMsg msg={syncMsg} /></div>}

        {/* Sync All */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 mb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-foreground">Sync All Providers</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Pulls usage, cost, and Claude Code analytics from Anthropic for the last 7 days, then runs alert checks.
              </p>
              {providerStatus?.lastSyncAt && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Last sync: <span className="text-foreground font-medium">{new Date(providerStatus.lastSyncAt).toLocaleString()}</span>
                </p>
              )}
            </div>
            <Button
              disabled={!connected || syncing !== null || isViewer}
              onClick={handleSyncAll}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 flex-shrink-0 px-5"
            >
              {syncing === "all"
                ? <><Loader2 className="h-4 w-4 animate-spin" />Syncing…</>
                : <><RefreshCw className="h-4 w-4" />Sync All</>}
            </Button>
          </div>
        </div>

        {/* Per-provider sync rows */}
        <div className="space-y-2">
          {PROVIDERS.filter(prov => prov.key !== "gemini" && prov.key !== "perplexity").map(prov => {
            const isAnthropicFamily = prov.key === "anthropic" || prov.key === "claude_code";
            const isConnected       = isAnthropicFamily ? connected : provConnections[prov.key] === "connected";
            const canSync           = isConnected;
            const isSyncing       = syncing === prov.key;
            return (
              <div key={prov.key} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${isConnected ? "border-border bg-muted/20" : "border-border/50 bg-muted/10 opacity-60"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{prov.displayName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${CATEGORY_BADGE[prov.category]}`}>
                      {CATEGORY_LABELS[prov.category]}
                    </span>
                    {!isConnected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-500/10 text-slate-400">
                        not configured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isConnected ? prov.credentialLabel : "Configure this provider in Provider Integrations above to enable sync"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canSync || syncing !== null || isViewer}
                  onClick={() => handleProviderSync(prov.key)}
                  title={!isConnected ? "Connect this provider first" : undefined}
                  className="ml-4 flex-shrink-0 gap-1.5 text-xs"
                >
                  {isSyncing
                    ? <><Loader2 className="h-3 w-3 animate-spin" />Syncing…</>
                    : <><RefreshCw className="h-3 w-3" />Sync</>}
                </Button>
              </div>
            );
          })}
        </div>

        {!connected && (
          <p className="mt-4 text-xs text-muted-foreground/50">
            Configure your Anthropic Admin API key in Provider Integrations above to enable real data sync.
          </p>
        )}
      </SectionCard>

      {/* 6 — Recent Sync Runs */}
      <SectionCard
        title="Recent Sync Runs"
        subtitle={
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Latest 50 sync attempts across all providers
          </span>
        }
        noPadding
      >
        {loadingSyncRuns ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : syncRunsErr ? (
          <div className="flex items-center gap-2 m-5 rounded-xl px-3.5 py-2.5 text-sm border bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Could not load sync history. The table will appear after a provider sync is triggered.
          </div>
        ) : syncRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <History className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">No sync runs yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Sync history will appear here after a provider sync is triggered.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className={TH}>Provider</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Records</th>
                  <th className={TH}>Started</th>
                  <th className={TH}>Duration</th>
                  <th className={TH}>Error / Message</th>
                </tr>
              </thead>
              <tbody>
                {syncRuns.map(run => (
                  <tr key={run.id} className={TR}>
                    <td className={TD}>
                      <span className="font-medium text-foreground">
                        {PROVIDER_DISPLAY[run.provider] ?? run.provider}
                      </span>
                    </td>
                    <td className={TD}>
                      <SyncRunStatusBadge status={run.status} />
                    </td>
                    <td className={TD_MONO}>{run.recordsSynced.toLocaleString()}</td>
                    <td className={TD}>
                      <span className="text-muted-foreground" title={new Date(run.startedAt).toLocaleString()}>
                        {fmtRelative(run.startedAt)}
                      </span>
                    </td>
                    <td className={TD_MONO}>{fmtDuration(run.durationMs)}</td>
                    <td className={TD}>
                      {run.errorMessage ? (
                        <span className="text-red-400/80 text-xs truncate max-w-xs block" title={run.errorMessage}>
                          {run.errorMessage.length > 80
                            ? run.errorMessage.slice(0, 80) + "…"
                            : run.errorMessage}
                        </span>
                      ) : run.status === "success" ? (
                        <span className="text-muted-foreground/50 text-xs">—</span>
                      ) : run.status === "running" || run.status === "stale" ? (
                        <span className="text-cyan-400/60 text-xs">In progress…</span>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* 7 — Security */}
      <SectionCard title="Security">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 max-w-md">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 flex-shrink-0">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Change Password</p>
            <p className="text-xs text-muted-foreground">Update your account password</p>
          </div>
          <Button size="sm" variant="outline" disabled={isViewer}>Change</Button>
        </div>
      </SectionCard>

      {/* Configure modal */}
      {configProv && (
        <ConfigureModal
          prov={configProv}
          isConnected={
            configProv.key === "anthropic" || configProv.key === "claude_code"
              ? connected
              : provConnections[configProv.key] === "connected"
          }
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onClose={() => setConfigProv(null)}
          saving={savingProv}
        />
      )}
    </PageShell>
  );
}
