import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * TokenLens auth proxy (Next.js 16's middleware replacement).
 *
 * Layer 1 of route protection. Runs on every request matched by `config.matcher`.
 * Layer 2 is the server-side guard in `app/(dashboard)/layout.tsx` (defense-in-depth).
 * Layer 3 is `requireSession()` inside each `/api/*` route handler (source of truth).
 *
 * Public access (no session required):
 *   - Marketing pages: /, /platform, /solutions, /use-cases, /integrations,
 *     /pricing, /security, /resources, /about, /contact, /demo, /privacy, /terms
 *   - Auth pages:      /login, /signup
 *   - Auth API:        /api/auth/login, /api/auth/logout
 *   - Static assets:   /_next/*, /favicon.ico, /robots.txt, public files
 *
 * Protected (session required):
 *   - All dashboard portal pages (/dashboard, /ai-users, /settings, etc.)
 *   - All /api/* routes EXCEPT the public auth API listed above
 */

// Exact-match public marketing + auth pages
const PUBLIC_PAGES = new Set<string>([
  "/",
  "/platform",
  "/solutions",
  "/use-cases",
  "/integrations",
  "/pricing",
  "/security",
  "/resources",
  "/about",
  "/contact",
  "/demo",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
]);

// Public API prefixes
//   - auth: needed to actually log in / out
//   - public lead-capture endpoints: receive submissions from the marketing site
const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/contact",
  "/api/demo-request",
];

function isPublicPath(pathname: string): boolean {
  // 1. Next.js file-convention assets — opengraph-image, twitter-image, icon,
  //    apple-icon. URLs may carry a content-hash suffix and live under any
  //    route group (e.g. `/contact/opengraph-image-1a8v0t`). `includes` is the
  //    most defensive check — these names never appear in real product URLs.
  if (
    pathname.includes("/opengraph-image") ||
    pathname.includes("/twitter-image")   ||
    pathname.endsWith("/icon")            ||
    pathname.endsWith("/apple-icon")
  ) {
    return true;
  }

  // 2. Exact-match marketing + auth pages
  const normalized = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  if (PUBLIC_PAGES.has(normalized)) return true;

  // 3. Public API prefixes
  if (PUBLIC_API_PREFIXES.some(p => pathname.startsWith(p))) return true;

  return false;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Public — always allow ─────────────────────────────────────────────────
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("tl_session")?.value;
  const valid = token ? verifyToken(token) : null;

  // ── API routes — return 401 JSON if unauthenticated ───────────────────────
  if (pathname.startsWith("/api/")) {
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Page routes — redirect unauthenticated to /login with redirect param ─
  if (!valid) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve original destination so the login page can return the user there
    loginUrl.searchParams.set("redirect", pathname + (req.nextUrl.search ?? ""));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every request EXCEPT static assets + Next internals
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};
