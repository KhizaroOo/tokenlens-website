"use client";
import { DevProviderDetailPage } from "@/components/dashboard/DevProviderDetailPage";
export default function CursorPage() {
  return <DevProviderDetailPage providerSlug="cursor" label="Cursor" subtitle="AI-powered editor — completions, acceptance rate, and seat utilization" isCopilotStyle={true} accentColor="text-violet-400" />;
}
