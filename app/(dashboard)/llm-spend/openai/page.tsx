"use client";
import { ProviderDetailPage } from "@/components/dashboard/ProviderDetailPage";
export default function OpenAiPage() {
  return <ProviderDetailPage providerSlug="openai" label="OpenAI" subtitle="GPT-4o, GPT-4o-mini, GPT-4 Turbo — token usage and cost" accentColor="text-cyan-500" />;
}
