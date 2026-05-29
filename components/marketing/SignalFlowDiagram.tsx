/**
 * Signal Flow Diagram — replaces the old DataFlowDiagram.
 * Observatory instrument feel: numbered nodes connected by signal arcs.
 */

const STAGES = [
  { id: "01", label: "Connect",  hint: "8 PROVIDERS",   tone: "var(--sg-text)"   },
  { id: "02", label: "Sync",     hint: "ENCRYPTED",     tone: "var(--sg-signal)" },
  { id: "03", label: "Analyze",  hint: "USERS · MODELS",tone: "var(--sg-lens)"   },
  { id: "04", label: "Detect",   hint: "ANOMALY",       tone: "var(--sg-anomaly)"},
  { id: "05", label: "Govern",   hint: "POLICIES",      tone: "var(--sg-budget)" },
  { id: "06", label: "Report",   hint: "PDF · CSV",     tone: "var(--sg-signal)" },
];

export function SignalFlowDiagram() {
  return (
    <div className="relative border-y-2 border-[var(--sg-ink)] py-12 lg:py-16">
      {/* Big numbered marker on top-left */}
      <p className="sg-caption text-[var(--sg-text-mute)] mb-6">SIGNAL CHAIN · 06 STAGES</p>

      {/* Horizontal flow rail */}
      <div className="relative">
        {/* Connecting rail */}
        <div className="absolute left-0 right-0 top-12 h-px bg-[var(--sg-line)] hidden md:block" />
        <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-[var(--sg-signal)] to-transparent opacity-50 hidden md:block sg-signal-scan" />

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-3 relative">
          {STAGES.map((s, i) => (
            <div key={s.id} className="relative">
              {/* Number */}
              <span className="sg-number text-xs text-[var(--sg-text-mute)] block">{s.id} / 06</span>

              {/* Node */}
              <div className="relative mt-3 mb-3 mx-auto md:mx-0">
                <div className="relative h-6 w-6 mt-0.5">
                  <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: s.tone, opacity: 0.18 }} />
                  <span aria-hidden className="absolute inset-1 rounded-full border" style={{ borderColor: s.tone }} />
                  <span aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full" style={{ background: s.tone }} />
                </div>
              </div>

              {/* Label */}
              <h4 className="sg-display text-2xl text-[var(--sg-text)] leading-tight">{s.label}</h4>
              <p className="sg-caption text-[var(--sg-text-mute)] mt-1">{s.hint}</p>

              {/* Vertical hairline from node to label on desktop */}
              {i < STAGES.length - 1 && (
                <div className="hidden md:block absolute top-9 right-0 w-px h-3 bg-[var(--sg-line)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom caption */}
      <div className="mt-12 flex items-center justify-between sg-caption text-[var(--sg-text-mute)]">
        <span>INPUT — PROVIDER CREDENTIALS</span>
        <span aria-hidden className="h-px w-12 bg-[var(--sg-line)] hidden sm:block" />
        <span>OUTPUT — OPERATING INTELLIGENCE</span>
      </div>
    </div>
  );
}
