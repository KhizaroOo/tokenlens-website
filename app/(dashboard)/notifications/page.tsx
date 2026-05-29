"use client";

import { BellRing } from "lucide-react";
import { ComingSoonShell } from "@/components/dashboard/ComingSoonShell";

export default function NotificationsPage() {
  return (
    <ComingSoonShell
      title="Notifications"
      subtitle="Multi-channel delivery for alerts, digests, and sync events"
      icon={BellRing}
      iconAccent="emerald"
      tagline="Pipe TokenLens events to where your team already lives. Configure Slack, Microsoft Teams, email, or generic webhooks per alert severity so the right people are notified — and only the right people."
      valueBullets={[
        "Channels: Slack, Microsoft Teams, email, PagerDuty, generic webhook",
        "Per-rule routing: critical → PagerDuty, warning → Slack #ai-spend, info → digest email",
        "Daily and weekly digest emails for engineering managers",
        "Delivery audit log — confirm every notification reached its channel",
      ]}
      sampleInsights={[
        { label: "Channels",          value: "0 configured", hint: "Connect Slack to start",   accent: "amber"   },
        { label: "Notifications (7d)", value: "—",            hint: "After first channel set", accent: "cyan"    },
        { label: "Digest cadence",     value: "Weekly",       hint: "Monday 9am default",      accent: "emerald" },
        { label: "Delivery success",   value: "—",            hint: "Tracked per channel",     accent: "indigo"  },
      ]}
      audience={[
        { role: "Eng Mgr",  benefit: "Spot a runaway sprint cost in Slack instead of in the next month's invoice." },
        { role: "FinOps",   benefit: "Weekly cost digest with anomalies pre-flagged — no manual chasing." },
        { role: "On-call",  benefit: "Route critical AI-spend incidents straight to PagerDuty alongside infra alerts." },
      ]}
    />
  );
}
