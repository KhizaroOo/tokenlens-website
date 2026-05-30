import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — TokenLens",
  description:
    "The TokenLens application portal is the secure, authenticated dashboard. This public website links you to it.",
};

/**
 * Public website = marketing only. The authenticated application portal lives
 * in a separate deployment (the `tokenlens-idea` app). Set NEXT_PUBLIC_PORTAL_URL
 * to that deployment's origin and this page links straight to its /login.
 * Until it is hosted, we show an honest "not publicly hosted yet" state with
 * Book-a-Demo / Contact fallbacks — no fake sign-in form.
 */
const PORTAL_URL = (process.env.NEXT_PUBLIC_PORTAL_URL || "").replace(/\/$/, "");

const CARD =
  "relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl";

export default function LoginPage() {
  return (
    <div className={CARD}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Brand */}
      <div className="mb-6 flex items-center gap-3">
        <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30">
          <span className="absolute inset-[13px] rounded-full border-[3px] border-[#060a12]" />
        </span>
        <span className="text-2xl font-black tracking-tight text-white">
          Token<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Lens</span>
        </span>
      </div>

      <h1 className="text-lg font-bold text-white/90">Sign in to the TokenLens portal</h1>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        The dashboard is the secure, authenticated application. This is the public website — it
        links you to the portal but never handles your credentials.
      </p>

      {PORTAL_URL ? (
        <a
          href={`${PORTAL_URL}/login`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-emerald-500"
        >
          Continue to the portal
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      ) : (
        <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-[13px] leading-relaxed text-amber-200/90">
          The application portal isn&apos;t publicly hosted yet. Book a demo and our team will give
          you guided access.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/demo" className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/5">
          Book a Demo
        </Link>
        <Link href="/contact" className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/5">
          Contact Us
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-white/25">
        New to TokenLens? <Link href="/signup" className="text-emerald-400/80 hover:text-emerald-300">Request access</Link>
      </p>
    </div>
  );
}
