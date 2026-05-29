/**
 * Provider Constellation — used on the integrations page.
 *
 * Three concentric rings, one per provider category. Each provider sits on
 * its ring at a well-spaced angle so tags don't collide. Category labels
 * sit on the TOP of each ring (offset above the topmost provider slot).
 *
 * Positioning is percentage-based against the aspect-square container so
 * everything stays in proportion at any breakpoint.
 */

const VIEWBOX = 700; // svg width/height (-350 .. +350 in both axes)

type Provider = { name: string; angle: number; tone: string };
type Ring     = { id: string; label: string; rSvg: number; providers: Provider[] };

const RINGS: Ring[] = [
  {
    id: "llm",
    label: "LLM / API SPEND",
    rSvg: 130,
    providers: [
      { name: "Claude",     angle: -90, tone: "var(--sg-signal)" },
      { name: "OpenAI",     angle:   0, tone: "var(--sg-lens)"   },
      { name: "Gemini",     angle:  90, tone: "var(--sg-budget)" },
      { name: "Perplexity", angle: 180, tone: "var(--sg-budget)" },
    ],
  },
  {
    id: "dev",
    label: "DEVELOPER AI",
    rSvg: 220,
    providers: [
      { name: "Claude Code", angle: -90, tone: "var(--sg-signal)"  },
      { name: "GH Copilot",  angle:  30, tone: "var(--sg-anomaly)" },
      { name: "Cursor",      angle: 150, tone: "var(--sg-budget)"  },
    ],
  },
  {
    id: "biz",
    label: "BUSINESS AI",
    rSvg: 305,
    providers: [
      { name: "M365 Copilot", angle:   0, tone: "#6366F1"            },
      { name: "(more soon)",  angle: 180, tone: "var(--sg-text-mute)" },
    ],
  },
];

// Convert SVG radius → percent of half-edge of container
const pct = (rSvg: number) => (rSvg / VIEWBOX) * 100;

export function ProviderConstellation() {
  return (
    <div className="relative w-full max-w-[760px] mx-auto aspect-square">
      {/* Soft aura behind everything */}
      <div className="absolute inset-0 sg-lens-aura -z-10" />

      {/* SVG — rings + cross + center lens */}
      <svg
        viewBox={`${-VIEWBOX / 2} ${-VIEWBOX / 2} ${VIEWBOX} ${VIEWBOX}`}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        {/* Orbit rings */}
        {RINGS.map((r, i) => (
          <circle
            key={r.id}
            r={r.rSvg}
            fill="none"
            stroke="var(--sg-line)"
            strokeWidth="0.7"
            strokeDasharray={i === 2 ? "1 6" : i === 1 ? "2 6" : "3 5"}
          />
        ))}

        {/* Center cross */}
        <line x1={-VIEWBOX / 2} y1="0" x2={VIEWBOX / 2} y2="0" stroke="var(--sg-line)" strokeWidth="0.4" />
        <line x1="0" y1={-VIEWBOX / 2} x2="0" y2={VIEWBOX / 2} stroke="var(--sg-line)" strokeWidth="0.4" />

        {/* Faint signal lines from center to each provider — gives a wired-up feel */}
        {RINGS.flatMap(r =>
          r.providers.map(p => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <line
                key={`${r.id}-line-${p.name}`}
                x1="0" y1="0"
                x2={Math.cos(rad) * r.rSvg}
                y2={Math.sin(rad) * r.rSvg}
                stroke={p.tone}
                strokeWidth="0.5"
                strokeOpacity="0.35"
                strokeDasharray="2 4"
              />
            );
          })
        )}

        {/* Center lens */}
        <g>
          <circle r="48" fill="var(--sg-bg)" stroke="var(--sg-ink)" strokeWidth="1.2" />
          <circle r="32" fill="none" stroke="var(--sg-signal)" strokeWidth="0.8" />
          <circle r="14" fill="var(--sg-ink)" />
          <circle r="6"  fill="var(--sg-signal)" className="sg-pulse" style={{ transformOrigin: "center" }} />
        </g>
      </svg>

      {/* Ring category labels — placed ABOVE the topmost slot of each ring
          (topmost slot is at angle -90°, i.e. straight up). */}
      {RINGS.map(r => (
        <span
          key={`label-${r.id}`}
          className="absolute left-1/2 sg-caption text-[var(--sg-text-mute)] -translate-x-1/2 bg-[var(--sg-bg)]/85 backdrop-blur-sm px-2 whitespace-nowrap"
          style={{ top: `calc(${50 - pct(r.rSvg)}% - 14px)` }}
        >
          — {r.label} —
        </span>
      ))}

      {/* Provider tags — properly spaced on their rings via percentage positioning */}
      {RINGS.flatMap(r =>
        r.providers.map(p => {
          const rad  = (p.angle * Math.PI) / 180;
          const xPct = 50 + Math.cos(rad) * pct(r.rSvg);
          const yPct = 50 + Math.sin(rad) * pct(r.rSvg);
          return (
            <div
              key={`${r.id}-${p.name}`}
              className="absolute"
              style={{
                left: `${xPct}%`,
                top:  `${yPct}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="flex items-center gap-1.5 border sg-line bg-[var(--sg-panel)] px-2.5 py-1 whitespace-nowrap shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.tone }} />
                <span className="sg-caption text-[var(--sg-text)]">{p.name}</span>
              </div>
            </div>
          );
        })
      )}

      {/* Bottom anchor caption */}
      <div className="absolute -bottom-10 left-0 right-0 text-center sg-caption text-[var(--sg-text-mute)]">
        TOKENLENS · OPERATING CORE
      </div>
    </div>
  );
}
