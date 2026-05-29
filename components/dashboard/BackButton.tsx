"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href }: { href: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6"
    >
      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
      Back
    </button>
  );
}
