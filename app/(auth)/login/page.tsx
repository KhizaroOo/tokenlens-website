"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Sanitize a `?redirect=` value: only allow same-origin app paths.
 * Rejects external URLs, protocol-relative URLs, and auth-loop paths.
 */
function safeRedirect(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Must be an absolute path starting with "/" — not "//", not "/\"
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/dashboard";
  // Don't loop back to /login or /signup
  if (raw.startsWith("/login") || raw.startsWith("/signup")) return "/dashboard";
  return raw;
}

const INPUT_CLS = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 transition-all duration-200 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/8";
const LABEL_CLS = "block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5";

export default function LoginPage() {
  // useSearchParams() must be inside a Suspense boundary
  return (
    <Suspense fallback={<div className="w-full max-w-[400px] h-10" aria-hidden />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = safeRedirect(searchParams.get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid email or password");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo + wordmark */}
      <div className="mb-8 text-center">
        <div className="relative inline-block mb-5">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-xl scale-125" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-500/40">
            <Zap className="h-8 w-8 text-white drop-shadow" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Token<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Lens</span>
        </h1>
        <p className="text-white/40 text-sm mt-1.5 font-medium">AI Usage & Cost Intelligence</p>
      </div>

      {/* Glass card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <h2 className="text-base font-bold text-white/90 mb-6">Sign in to your account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={INPUT_CLS + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 mt-1 disabled:opacity-50 shadow-lg shadow-emerald-500/25 transition-all duration-200 rounded-xl"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Login hint */}
        <div className="mt-5 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
          <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest mb-1.5">Login credentials</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/60 font-data">admin@tokenlens.ai</span>
            <span className="text-white/15 text-xs">/</span>
            <span className="text-white/60 font-data">admin123</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-white/20">
        TokenLens · AI Usage Intelligence Platform
      </p>
    </div>
  );
}
