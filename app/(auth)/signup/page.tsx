import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request access — TokenLens",
  description:
    "TokenLens onboards teams in a guided model. Request access and our team will set you up.",
};

const PORTAL_URL = (process.env.NEXT_PUBLIC_PORTAL_URL || "").replace(/\/$/, "");

const CARD =
  "relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl";

/**
 * No public self-serve provisioning is exposed. Rather than present a form that
 * does nothing, we route access requests to the real lead-capture flow at /demo
 * (which persists + notifies) — honest behaviour for a public marketing site.
 */
export default function SignupPage() {
  return (
    <div className={CARD}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="mb-6 flex items-center gap-3">
        <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30">
          <span className="absolute inset-[13px] rounded-full border-[3px] border-[#060a12]" />
        </span>
        <span className="text-2xl font-black tracking-tight text-white">
          Token<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Lens</span>
        </span>
      </div>

      <h1 className="text-lg font-bold text-white/90">Get started with TokenLens</h1>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        TokenLens onboards teams in a guided model — no self-serve sign-up yet. Tell us about your
        team and we&apos;ll set you up, usually within one business day.
      </p>

      <Link
        href="/demo"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-emerald-500"
      >
        Request access
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </Link>

      <Link href="/contact" className="mt-3 block rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/5">
        Talk to the team
      </Link>

      <p className="mt-6 text-center text-xs text-white/25">
        Already onboarded?{" "}
        {PORTAL_URL ? (
          <a href={`${PORTAL_URL}/login`} className="text-emerald-400/80 hover:text-emerald-300">Sign in to the portal</a>
        ) : (
          <Link href="/login" className="text-emerald-400/80 hover:text-emerald-300">Sign in</Link>
        )}
      </p>
    </div>
  );
}
