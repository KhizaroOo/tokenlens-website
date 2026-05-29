import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";

/**
 * Dashboard layout — server-side login gate.
 *
 * Every page rendered under `app/(dashboard)/*` passes through here.
 * If the request has no valid `tl_session` cookie, the user is redirected
 * to `/login?redirect=<intended-path>` BEFORE any portal UI is rendered.
 *
 * This is the primary route-level gate. API routes keep their own
 * `requireSession()` checks as the source of truth for data security.
 */
export const dynamic = "force-dynamic";   // ensure cookie/header reads aren't cached

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    // Try to preserve the intended destination so the user lands back where they were aiming
    let redirectPath = "/dashboard";
    try {
      const h = await headers();
      // `next-url` is set by Next.js on dynamic SSR requests in App Router
      const nextUrl  = h.get("next-url");
      const referer  = h.get("referer");
      if (nextUrl && nextUrl.startsWith("/")) {
        redirectPath = nextUrl;
      } else if (referer) {
        try {
          const u = new URL(referer);
          if (u.pathname.startsWith("/") && !u.pathname.startsWith("/login") && !u.pathname.startsWith("/signup")) {
            redirectPath = u.pathname + (u.search ?? "");
          }
        } catch { /* ignore malformed referer */ }
      }
    } catch { /* headers() may throw in edge cases — fall back to default */ }

    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <AppSidebar />
      </div>
      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
