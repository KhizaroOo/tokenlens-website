import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /sitemap.xml
 *
 * Includes only **public** routes. Protected dashboard URLs and protected API
 * routes are deliberately excluded — they require authentication and have no
 * public crawl value.
 *
 * `/login` and `/signup` are included because they are public landing points
 * that returning users may search for by name.
 */

const PUBLIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  // Home + primary marketing
  { path: "/",             changeFrequency: "weekly",  priority: 1.0 },
  { path: "/platform",     changeFrequency: "weekly",  priority: 0.9 },
  { path: "/solutions",    changeFrequency: "weekly",  priority: 0.9 },
  { path: "/use-cases",    changeFrequency: "weekly",  priority: 0.9 },
  { path: "/integrations", changeFrequency: "weekly",  priority: 0.9 },
  { path: "/pricing",      changeFrequency: "weekly",  priority: 0.9 },
  { path: "/security",     changeFrequency: "monthly", priority: 0.7 },
  { path: "/about",        changeFrequency: "monthly", priority: 0.6 },
  { path: "/resources",    changeFrequency: "weekly",  priority: 0.6 },
  // Lead capture
  { path: "/contact",      changeFrequency: "monthly", priority: 0.8 },
  { path: "/demo",         changeFrequency: "monthly", priority: 0.8 },
  // Legal
  { path: "/privacy",      changeFrequency: "yearly",  priority: 0.3 },
  { path: "/terms",        changeFrequency: "yearly",  priority: 0.3 },
  // Auth entry points
  { path: "/login",        changeFrequency: "yearly",  priority: 0.2 },
  { path: "/signup",       changeFrequency: "yearly",  priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url:             `${SITE_URL}${path}`,
    lastModified:    now,
    changeFrequency,
    priority,
  }));
}
