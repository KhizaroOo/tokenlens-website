import { ImageResponse } from "next/og";

/**
 * Shared OpenGraph renderer for TokenLens.
 *
 * Returns a 1200×630 dark-mode Signal Gallery card with:
 *   - Eyebrow + TokenLens wordmark
 *   - Big editorial headline (provided by caller)
 *   - Sub-headline footnote
 *   - Corner ticks, emerald + cyan radial glows
 *
 * Used by `app/opengraph-image.tsx`, `app/(marketing)/contact/opengraph-image.tsx`,
 * and `app/(marketing)/demo/opengraph-image.tsx`. No external assets or fonts.
 */
export function renderOg(opts: {
  eyebrow?:  string;
  title:     string;
  subtitle?: string;
}): ImageResponse {
  const { eyebrow = "TOKENLENS · AI OPERATING LAYER", title, subtitle } = opts;

  return new ImageResponse(
    (
      <div
        style={{
          width:  "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#050505",
          color: "#F4F1E8",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
          position: "relative",
        }}
      >
        {/* Emerald glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -160, left: -160,
            width: 520, height: 520,
            background: "radial-gradient(circle, rgba(56,248,161,0.22) 0%, rgba(56,248,161,0) 70%)",
          }}
        />
        {/* Cyan glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -160, right: -160,
            width: 520, height: 520,
            background: "radial-gradient(circle, rgba(82,229,255,0.18) 0%, rgba(82,229,255,0) 70%)",
          }}
        />
        {/* Corner ticks */}
        <div style={{ position: "absolute", top: 28, left: 28,    width: 18, height: 18, borderTop: "2px solid #10A56F", borderLeft:  "2px solid #10A56F", display: "flex" }} />
        <div style={{ position: "absolute", top: 28, right: 28,   width: 18, height: 18, borderTop: "2px solid #10A56F", borderRight: "2px solid #10A56F", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 28, left: 28, width: 18, height: 18, borderBottom: "2px solid #10A56F", borderLeft:  "2px solid #10A56F", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 28, right: 28,width: 18, height: 18, borderBottom: "2px solid #10A56F", borderRight: "2px solid #10A56F", display: "flex" }} />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: "0.3em",
            color: "rgba(244,241,232,0.55)",
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#38F8A1", display: "flex" }} />
          {eyebrow}
        </div>

        {/* Wordmark */}
        <div
          style={{
            marginTop: 28,
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ color: "#F4F1E8" }}>Token</span>
          <span style={{ color: "#38F8A1" }}>Lens</span>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: 48,
            fontSize: subtitle ? 64 : 80,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            maxWidth: 980,
            color: "#F4F1E8",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              lineHeight: 1.25,
              color: "rgba(244,241,232,0.72)",
              maxWidth: 980,
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flexGrow: 1, display: "flex" }} />

        {/* Footer strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(244,241,232,0.16)",
            fontSize: 18,
            letterSpacing: "0.2em",
            color: "rgba(244,241,232,0.55)",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: "#10A56F", display: "flex" }} />
            COST · ADOPTION · GOVERNANCE
          </div>
          <div style={{ display: "flex" }}>LENS · v2.1</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
