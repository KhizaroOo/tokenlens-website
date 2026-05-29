"use client";
import { DevProviderDetailPage } from "@/components/dashboard/DevProviderDetailPage";
export default function ClaudeCodePage() {
  return <DevProviderDetailPage providerSlug="claude-code" label="Claude Code" subtitle="Agentic coding — sessions, commits, PRs, and cost" isCopilotStyle={false} accentColor="text-emerald-500" />;
}
