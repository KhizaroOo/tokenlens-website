"use client";

import { Lightbulb } from "lucide-react";
import { ComingSoonShell } from "@/components/dashboard/ComingSoonShell";

export default function SuggestionsPage() {
  return (
    <ComingSoonShell
      title="Suggestions"
      subtitle="Cost-saving and productivity recommendations driven by your usage"
      icon={Lightbulb}
      iconAccent="cyan"
      tagline="An always-on AI cost optimizer. TokenLens scans your daily usage and surfaces concrete, dollar-quantified actions — reclaim idle seats, downgrade over-provisioned models, consolidate underused providers — with one-click acceptance and tracked savings."
      valueBullets={[
        "Reclaim inactive Copilot / Cursor / Microsoft Copilot seats with one click",
        "Suggest the cheapest model that meets your prompt-mix latency and quality targets",
        "Identify users whose usage justifies bumping them to a higher tier (or downgrading)",
        "Surface unused projects and stale API keys for cleanup",
      ]}
      sampleInsights={[
        { label: "Reclaimable seats", value: "12",     hint: "$228/mo savings if removed",     accent: "emerald" },
        { label: "Model downgrade",   value: "$840",   hint: "GPT-4o → 4o-mini for batch jobs", accent: "cyan" },
        { label: "Stale API keys",    value: "5",      hint: "No usage in 60 days",             accent: "amber" },
        { label: "Tracked savings",   value: "$3.2K",  hint: "Last 90 days from accepted recs", accent: "emerald" },
      ]}
      audience={[
        { role: "CFO", benefit: "Continuously tighten the AI line item without throttling teams that are actively producing." },
        { role: "FinOps", benefit: "Replace quarterly cost reviews with a live optimizer that flags waste the day it appears." },
        { role: "Procurement", benefit: "Right-size contract renewals with adoption and idle-seat evidence." },
      ]}
    />
  );
}
