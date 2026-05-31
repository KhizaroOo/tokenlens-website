import { renderOg } from "@/lib/og-render";

export const dynamic = "force-static";

export const alt         = "Talk to the TokenLens team";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOg({
    eyebrow:  "TOKENLENS · CONTACT",
    title:    "Talk to the TokenLens team.",
    subtitle: "Sales, support, partnerships. A real human reads every message.",
  });
}
