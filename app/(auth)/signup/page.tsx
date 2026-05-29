"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * Signup is currently a contact-sales gate.
 * No public self-serve provisioning is exposed — qualified leads go through
 * /demo and /contact. This page collects intent and redirects to /demo.
 *
 * TODO: When self-serve provisioning is ready, replace this with a real signup form
 *       that calls /api/auth/signup and creates an organization + first user.
 */
export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center">
            <div className="h-2 w-2 rounded-full bg-[#050810]" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Token<span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Lens</span>
          </span>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <h1 className="mt-4 text-xl font-bold">Thanks for your interest</h1>
            <p className="mt-2 text-sm text-white/65">
              We&apos;ll be in touch shortly with onboarding details and a calendar link to schedule your kickoff.
            </p>
            <Link
              href="/demo"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#050810]"
            >
              Or book a demo now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Get started with TokenLens</h1>
            <p className="mt-2 text-sm text-white/65">
              TokenLens is rolling out in a guided onboarding model. Tell us a bit about your team and we&apos;ll get you set up — usually within 1 business day.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                // TODO: wire to real provisioning endpoint when self-serve is ready
                setSubmitted(true);
              }}
              className="mt-6 space-y-3"
            >
              <input
                type="text" required placeholder="Full name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
              />
              <input
                type="email" required placeholder="Work email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
              />
              <input
                type="text" placeholder="Company"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold rounded-full px-4 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#050810] hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-4 w-4" />
                Request access
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-xs text-white/45 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-300 hover:text-emerald-200 font-semibold">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
