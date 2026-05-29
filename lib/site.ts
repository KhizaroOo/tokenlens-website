/**
 * Canonical public site URL — used by `app/robots.ts`, `app/sitemap.ts`, and
 * OpenGraph metadata.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL or APP_URL       (recommended in production)
 *   2. NEXT_PUBLIC_VERCEL_URL  (auto-set by Vercel — needs `https://` prefix)
 *   3. http://localhost:3000                 (dev fallback if NODE_ENV !== production)
 *   4. https://tokenlens.ai                  (placeholder for prod builds with no env)
 *
 * TODO before public launch: set NEXT_PUBLIC_SITE_URL in the production env
 * (e.g. `https://tokenlens.ai`) so robots / sitemap / OG point at the real
 * canonical domain. The placeholder is intentionally a marketing-safe domain
 * we own / plan to own; replace with the verified canonical when DNS is live.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_URL;
  if (explicit && explicit.length > 0) {
    return explicit.replace(/\/$/, "");
  }

  // Vercel auto-injects this on previews / prod — host only, no scheme.
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel && vercel.length > 0) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  // Production with no env configured — fall back to the canonical placeholder.
  // TODO: replace this fallback once the real production env is wired.
  return "https://tokenlens.ai";
}

export const SITE_URL = resolveSiteUrl();
