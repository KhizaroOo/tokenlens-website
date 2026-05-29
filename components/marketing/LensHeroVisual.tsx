/**
 * Lens Hero Visual — central "living lens" art object for the homepage.
 *
 * Layout strategy (fixes the prior overlap bug):
 *  • CENTER         — the lens (SVG concentric circles, ~14% of container)
 *  • PROVIDER RING  — 7 providers evenly spaced on a single 38% radius ring
 *  • KPI CORNERS    — 4 KPI cards pinned to the 4 outer corners (no collision)
 *
 * All positioning is percentage-based against the aspect-square container,
 * so the visual scales cleanly at every breakpoint.
 */

const VIEWBOX     = 600;            // svg width / height
const RING_R_SVG  = 230;            // provider ring radius, in svg units
const RING_PCT    = (RING_R_SVG / VIEWBOX) * 100;  // → 38.3%

const PROVIDERS = [
  { name: "Claude",         tone: "var(--sg-signal)"  },
  { name: "OpenAI",         tone: "var(--sg-lens)"    },
  { name: "GitHub Copilot", tone: "var(--sg-anomaly)" },
  { name: "Cursor",         tone: "var(--sg-budget)"  },
  { name: "M365 Copilot",   tone: "#6366F1"           },
  { name: "Gemini",         tone: "var(--sg-budget)"  },
  { name: "Perplexity",     tone: "var(--sg-budget)"  },
];

// Evenly distribute around the ring, starting at top (-90°) and stepping CW.
const angles = PROVIDERS.map((_, i) => -90 + (i * 360) / PROVIDERS.length);

// 4 KPI cards — one per outer corner. Pinned via Tailwind utilities below.
const KPIS = [
  { corner: "tl", label: "MTD spend",    value: "$48.2K", tone: "var(--sg-budget)"  },
  { corner: "tr", label: "Active users", value: "428",    tone: "var(--sg-signal)"  },
  { corner: "bl", label: "Providers",    value: "8",      tone: "var(--sg-lens)"    },
  { corner: "br", label: "Optimization", value: "18%",    tone: "var(--sg-anomaly)" },
] as const;

const cornerClass: Record<(typeof KPIS)[number]["corner"], string> = {
  tl: "top-0 left-0",
  tr: "top-0 right-0",
  bl: "bottom-0 left-0",
  br: "bottom-0 right-0",
};

export function LensHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] aspect-square">
      {/* Outer aura */}
      <div className="absolute inset-0 sg-lens-aura -z-10" />

      {/* SVG — orbit rings + connection lines + center lens */}
      <svg
        viewBox={`${-VIEWBOX / 2} ${-VIEWBOX / 2} ${VIEWBOX} ${VIEWBOX}`}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="hero-lens-grad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"   stopColor="var(--sg-signal-glow)" stopOpacity="0.9" />
            <stop offset="60%"  stopColor="var(--sg-lens-glow)"   stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--sg-anomaly-glow)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric orbit rings */}
        <g fill="none" stroke="var(--sg-line)" strokeWidth="0.6">
          <circle r={RING_R_SVG + 30}                       strokeDasharray="1 6" />
          <circle r={RING_R_SVG}                             strokeDasharray="2 5" />
          <circle r={RING_R_SVG - 60}                        />
          <circle r="80" strokeDasharray="1 3"                                   />
        </g>

        {/* Cross hairs */}
        <g stroke="var(--sg-line)" strokeWidth="0.4">
          <line x1={-VIEWBOX / 2} y1="0" x2={VIEWBOX / 2} y2="0" />
          <line x1="0" y1={-VIEWBOX / 2} x2="0" y2={VIEWBOX / 2} />
        </g>

        {/* Signal connection lines — center → each provider on the ring */}
        {angles.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = Math.cos(rad) * RING_R_SVG;
          const y = Math.sin(rad) * RING_R_SVG;
          return (
            <line
              key={PROVIDERS[i].name}
              x1="0" y1="0" x2={x} y2={y}
              stroke={PROVIDERS[i].tone}
              strokeWidth="0.6"
              strokeOpacity="0.45"
              strokeDasharray="2 4"
            />
          );
        })}

        {/* Center lens — concentric apertures */}
        <g>
          <circle r="60" fill="url(#hero-lens-grad)" opacity="0.7" />
          <circle r="48" fill="var(--sg-bg)" />
          <circle r="48" fill="none" stroke="var(--sg-ink)" strokeWidth="1.2" />
          <circle r="32" fill="none" stroke="var(--sg-signal)" strokeWidth="0.8" />
          <circle r="14" fill="var(--sg-ink)" />
          <circle r="6"  fill="var(--sg-signal)" className="sg-pulse" style={{ transformOrigin: "center" }} />
          {/* aperture ticks */}
          <g stroke="var(--sg-ink)" strokeWidth="1" strokeLinecap="round">
            <line x1="0" y1="-58" x2="0" y2="-50" />
            <line x1="0" y1="50"  x2="0" y2="58"  />
            <line x1="-58" y1="0" x2="-50" y2="0" />
            <line x1="50"  y1="0" x2="58"  y2="0" />
          </g>
        </g>

        {/* Slow orbiting ticks for kinetic feel (single dot each, no overlap risk) */}
        <g className="sg-orbit-slow" style={{ transformOrigin: "center" }}>
          <circle cx={RING_R_SVG + 30} cy="0" r="2.5" fill="var(--sg-signal)" />
        </g>
        <g className="sg-orbit-med" style={{ transformOrigin: "center" }}>
          <circle cx={-(RING_R_SVG + 30)} cy="0" r="1.5" fill="var(--sg-lens)" />
        </g>
      </svg>

      {/* Provider name tags — evenly spaced ring, percentage-positioned */}
      {PROVIDERS.map((p, i) => {
        const rad = (angles[i] * Math.PI) / 180;
        // Position is % offset from center of container; container is aspect-square,
        // so x% and y% both refer to the same edge length.
        const xPct = 50 + Math.cos(rad) * RING_PCT;
        const yPct = 50 + Math.sin(rad) * RING_PCT;
        return (
          <div
            key={p.name}
            className="absolute"
            style={{
              left: `${xPct}%`,
              top:  `${yPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex items-center gap-1.5 border sg-line bg-[var(--sg-panel)]/85 backdrop-blur px-2.5 py-1 whitespace-nowrap shadow-sm">
              <span className="h-1 w-1 rounded-full" style={{ background: p.tone }} />
              <span className="sg-caption text-[var(--sg-text)]">{p.name}</span>
            </div>
          </div>
        );
      })}

      {/* KPI cards — pinned to four outer corners, well outside provider ring */}
      {KPIS.map(k => (
        <div
          key={k.label}
          className={`absolute ${cornerClass[k.corner]}`}
        >
          <div className="relative border sg-line bg-[var(--sg-bg)]/95 backdrop-blur-sm p-2.5 min-w-[112px]">
            <span
              aria-hidden
              className="absolute top-0 left-0 h-px w-5"
              style={{ background: k.tone }}
            />
            <p className="sg-caption text-[var(--sg-text-mute)] text-[9px]">{k.label}</p>
            <p className="sg-number font-bold text-base text-[var(--sg-text)] leading-none mt-0.5">
              {k.value}
            </p>
          </div>
        </div>
      ))}

      {/* Bottom caption */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-between sg-caption text-[var(--sg-text-mute)]">
        <span>LENS · v2.1</span>
        <span>8 PROVIDERS COVERED</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
