import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";

/**
 * Server-side metadata for /demo.
 * The page itself is `"use client"` (form state + handlers), so it cannot
 * export metadata directly. This thin server layout supplies it.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Book a Demo — TokenLens",
  description:
    "See TokenLens applied to your AI stack — a twenty-minute live walkthrough of the multi-provider AI spend, adoption, and governance dashboard.",
  openGraph: {
    title: "Book a Demo — TokenLens",
    description:
      "A twenty-minute live walkthrough of the AI operating dashboard, against your provider mix.",
    type: "website",
    // OG image auto-wired by sibling `opengraph-image.tsx`.
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F2E8" },
    { media: "(prefers-color-scheme: dark)",  color: "#050505" },
  ],
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
