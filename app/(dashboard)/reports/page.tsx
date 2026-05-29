"use client";

import { FileBarChart } from "lucide-react";
import { ComingSoonShell } from "@/components/dashboard/ComingSoonShell";

export default function ReportsPage() {
  return (
    <ComingSoonShell
      title="Reports"
      subtitle="Scheduled and on-demand executive reports"
      icon={FileBarChart}
      iconAccent="cyan"
      tagline="Board-ready PDF and CSV reports for every stakeholder. Weekly digest for engineering managers, monthly cost roll-up for finance, quarterly ROI review for the executive team — all generated, emailed, and archived automatically."
      valueBullets={[
        "Scheduled delivery: weekly, monthly, or quarterly",
        "Per-team, per-provider, and per-model breakdowns in one PDF",
        "CSV exports for ingestion into Snowflake / BigQuery / your data warehouse",
        "Branded with your organization logo for stakeholder distribution",
      ]}
      sampleInsights={[
        { label: "Templates",        value: "8",       hint: "Exec, FinOps, Eng Mgr, Audit, …", accent: "emerald" },
        { label: "Scheduled",        value: "Weekly",  hint: "Monday 9am to leadership",        accent: "cyan"    },
        { label: "Last report",      value: "—",       hint: "Generates on next schedule",      accent: "amber"   },
        { label: "Export formats",   value: "PDF/CSV", hint: "Plus signed S3 links",            accent: "indigo"  },
      ]}
      audience={[
        { role: "CFO",      benefit: "Replace ad-hoc spreadsheet pulls with consistent monthly AI cost statements." },
        { role: "CTO",      benefit: "Show the board exactly where the AI budget went and what it delivered." },
        { role: "Compliance", benefit: "Maintain an archive of every reported figure for audit defensibility." },
      ]}
    />
  );
}
