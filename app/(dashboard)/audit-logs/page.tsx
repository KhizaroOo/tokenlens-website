"use client";

import { ClipboardList } from "lucide-react";
import { ComingSoonShell } from "@/components/dashboard/ComingSoonShell";

export default function AuditLogsPage() {
  return (
    <ComingSoonShell
      title="Audit Logs"
      subtitle="Tamper-evident audit trail for SOC 2 and internal compliance"
      icon={ClipboardList}
      iconAccent="indigo"
      tagline="Every configuration change, credential rotation, sync run, and admin action is logged with actor, timestamp, IP, and resource. Searchable, filterable, exportable — and immutable enough to satisfy your SOC 2 / ISO 27001 auditor."
      valueBullets={[
        "Records every provider connect / disconnect, sync, and budget change",
        "Cryptographic hash-chain so log tampering is detectable",
        "Filter by actor, action type, provider, date range, or resource ID",
        "CSV export ready for SOC 2 evidence collection",
      ]}
      sampleInsights={[
        { label: "Events (30d)",      value: "1,284",   hint: "Across all admins",        accent: "indigo"  },
        { label: "Credential rotations", value: "3",     hint: "Last: 4 days ago",        accent: "emerald" },
        { label: "Failed logins",     value: "0",        hint: "Clean for last 7 days",   accent: "emerald" },
        { label: "Retention",         value: "365d",     hint: "Configurable per policy", accent: "cyan"    },
      ]}
      audience={[
        { role: "Compliance", benefit: "Hand auditors a complete, tamper-evident change log without manual reconstruction." },
        { role: "Security",   benefit: "Investigate incidents with attacker timeline and admin-action context." },
        { role: "CTO",        benefit: "Demonstrate governance maturity to enterprise customers and procurement teams." },
      ]}
    />
  );
}
