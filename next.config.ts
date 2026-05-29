import type { NextConfig } from "next";

/**
 * Conditional configuration:
 * - Default (server mode): standard Next.js build with security headers, API routes, Prisma, JWT auth
 * - Static export mode (NEXT_OUTPUT_MODE=export): for GitHub Pages deployment
 *     · Marketing pages + portal UI shells render statically
 *     · API routes must be excluded before build (done in the deploy workflow)
 *     · Backend features (login, sync, live data) are inert on static deploy
 */
const isExport  = process.env.NEXT_OUTPUT_MODE === "export";
const basePath  = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const securityHeaders = [
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "X-Frame-Options",         value: "DENY" },
  { key: "X-XSS-Protection",        value: "1; mode=block" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = isExport
  ? {
      // ── GitHub Pages / static export ────────────────────────────────────────
      output:        "export",
      basePath:      basePath || undefined,
      assetPrefix:   basePath || undefined,
      images:        { unoptimized: true },
      trailingSlash: true,
      // headers() is incompatible with `output: export` — omitted
    }
  : {
      // ── Standard server build (Node host: Vercel / Render / self-hosted) ────
      headers: async () => [
        { source: "/(.*)", headers: securityHeaders },
      ],
    };

export default nextConfig;
