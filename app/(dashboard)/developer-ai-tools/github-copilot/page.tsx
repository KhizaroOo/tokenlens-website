"use client";
import { DevProviderDetailPage } from "@/components/dashboard/DevProviderDetailPage";
export default function GitHubCopilotPage() {
  return <DevProviderDetailPage providerSlug="github-copilot" label="GitHub Copilot" subtitle="AI code suggestions — acceptance rate and seat utilization" isCopilotStyle={true} accentColor="text-slate-400" />;
}
