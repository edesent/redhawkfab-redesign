import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

/** DEMO BUILD — blocked from search until ./go-live.sh --live. See README. */
const LIVE = process.env.NEXT_PUBLIC_SITE_LIVE === "true";

export default function robots(): MetadataRoute.Robots {
  if (!LIVE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
