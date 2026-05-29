/**
 * Default OpenGraph image for the whole app.
 *
 * Next.js auto-discovers `app/opengraph-image.tsx` and wires it into every
 * route's `<meta property="og:image">` and Twitter card unless a more specific
 * file overrides it. Per-page overrides live next to the page:
 *   - app/(marketing)/contact/opengraph-image.tsx
 *   - app/(marketing)/demo/opengraph-image.tsx
 *
 * 1200×630 — the canonical OG size.
 */

import { renderOg } from "@/lib/og-render";

export const runtime = "edge";

export const alt         = "TokenLens — AI Spend & Productivity Intelligence";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOg({
    eyebrow:  "TOKENLENS · AI OPERATING LAYER",
    title:    "AI Spend & Productivity Intelligence",
    subtitle: "Control your company's AI spend before it becomes your next cloud bill.",
  });
}
