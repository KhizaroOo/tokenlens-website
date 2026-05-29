import { renderOg } from "@/lib/og-render";

export const runtime = "edge";

export const alt         = "Book a TokenLens demo";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOg({
    eyebrow:  "TOKENLENS · BOOK A DEMO",
    title:    "See TokenLens applied to your AI stack.",
    subtitle: "Twenty minutes. One operating lens. Your entire AI footprint in one view.",
  });
}
