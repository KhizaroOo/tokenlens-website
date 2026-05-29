"use client";

import { Bell } from "lucide-react";
import { ComingSoonShell } from "@/components/dashboard/ComingSoonShell";

export default function AlertsPage() {
  return (
    <ComingSoonShell
      title="Alerts"
      subtitle="Threshold rules and anomaly detection across providers"
      icon={Bell}
      iconAccent="amber"
      tagline="Catch runaway AI spend before it shows up in next month's invoice. Set hard budgets, soft thresholds, and anomaly rules per provider, team, or user — and get notified the moment something is off-pattern."
      valueBullets={[
        "Per-provider monthly budget alerts (hard cap and 80% soft warning)",
        "Sudden-spike anomaly detection — 3× day-over-day token bursts flagged automatically",
        "Per-team budget enforcement with per-user fairness rules",
        "Inactive-seat alerts so you stop paying for licences nobody uses",
      ]}
      sampleInsights={[
        { label: "Active rules",       value: "14",     hint: "Across 6 providers",             accent: "emerald" },
        { label: "Triggered (7d)",     value: "3",      hint: "1 critical, 2 warning",          accent: "amber" },
        { label: "Spend overrun",      value: "$612",   hint: "OpenAI vs. monthly cap",         accent: "red"   },
        { label: "Anomalies detected", value: "2",      hint: "Cursor team-A: 4× normal usage", accent: "cyan"  },
      ]}
      audience={[
        { role: "CFO", benefit: "Sleep at night knowing AI overruns are caught the same day, not the same quarter." },
        { role: "CTO", benefit: "Protect production budgets from rogue scripts, misconfigured eval jobs, or runaway agents." },
        { role: "Security", benefit: "Detect compromised API keys via anomaly spikes well before the invoice arrives." },
      ]}
    />
  );
}
