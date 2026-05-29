"use client";

import { TrendingUp } from "lucide-react";
import { ComingSoonShell } from "@/components/dashboard/ComingSoonShell";

export default function RoiPage() {
  return (
    <ComingSoonShell
      title="AI ROI"
      subtitle="Return on investment across every AI tool and team"
      icon={TrendingUp}
      iconAccent="emerald"
      tagline="Quantify the business return of your AI spend. TokenLens correlates AI costs with developer output, ticket throughput, and team velocity so leadership can answer the hardest question on every board deck: is the AI budget actually paying for itself?"
      valueBullets={[
        "Cost-per-PR and cost-per-resolved-ticket for every engineering team",
        "Productivity uplift since each AI tool was rolled out (vs. baseline)",
        "Adoption score per team — high / healthy / low / inactive",
        "Side-by-side comparison: $/active developer for Copilot vs. Cursor vs. Claude Code",
      ]}
      sampleInsights={[
        { label: "Cost / PR", value: "$4.21", hint: "Down 38% QoQ — Copilot adoption up", accent: "emerald" },
        { label: "Avg uplift", value: "+22%",  hint: "Story points per dev / sprint",      accent: "cyan" },
        { label: "Adoption",  value: "78%",   hint: "Healthy across engineering",          accent: "emerald" },
        { label: "Idle spend", value: "$1.4K", hint: "Inactive seats this month",          accent: "amber" },
      ]}
      audience={[
        { role: "CFO",  benefit: "Justify the AI line item with hard correlation to delivery output, not vendor-side promises." },
        { role: "CTO",  benefit: "See which tools move engineering velocity and which are paid for but unused." },
        { role: "Eng Mgr", benefit: "Identify which teams need enablement vs. which are getting full value already." },
      ]}
    />
  );
}
