import type { ReactNode } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Marketing layout — applies the `signal-gallery` class which scopes the
 * entire Signal Gallery design system (colors, type, etc.) to public pages.
 * The portal layout is untouched.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="signal-gallery min-h-screen relative">
      {/* Spotlight + soft ambient glow — radial gradients work in both themes */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(56,248,161,0.10), transparent 70%)",
            "radial-gradient(ellipse 50% 40% at 100% 30%, rgba(82,229,255,0.06), transparent 60%)",
            "radial-gradient(ellipse 60% 50% at 0% 90%, rgba(167,139,250,0.05), transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Subtle ledger grid — fine, low-opacity, anchored to columns */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--sg-line-soft) 1px, transparent 1px)",
          backgroundSize: "calc((100% - 0px) / 12) 100%",
          opacity: 0.4,
        }}
      />

      <MarketingHeader />
      <main className="pt-20">{children}</main>
      <MarketingFooter />
    </div>
  );
}
