import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Page not found — TokenLens",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050810] text-slate-900 dark:text-white flex items-center justify-center p-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.10), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(6,182,212,0.06), transparent 60%)",
        }}
      />
      <div className="max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20 grid place-items-center">
          <AlertCircle className="h-7 w-7 text-emerald-500" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-white/65 leading-relaxed">
          That route doesn&apos;t exist — or you may be on the static demo site
          where backend pages (login, dashboard data) aren&apos;t available.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#050810] hover:opacity-90 transition-opacity"
          >
            Back home <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/platform"
            className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-5 py-2.5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Explore platform
          </Link>
        </div>
      </div>
    </div>
  );
}
