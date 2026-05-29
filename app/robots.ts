import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /robots.txt
 *
 * - Allow crawling of public marketing routes and `/login` / `/signup`.
 * - Disallow every protected dashboard route and every API route except the
 *   public auth + lead-capture endpoints (those don't need to be indexed
 *   either, but disallowing all of `/api/*` is the safest blanket rule).
 *
 * The sitemap lives at `/sitemap.xml` (see `app/sitemap.ts`).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/ai-users",
          "/ai-teams",
          "/ai-models",
          "/providers",
          "/settings",
          "/claude-code",
          "/limitations",
          "/developer-ai-tools",
          "/llm-spend",
          "/business-productivity-ai",
          "/alerts",
          "/reports",
          "/audit-logs",
          "/notifications",
          "/roi",
          "/suggestions",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
