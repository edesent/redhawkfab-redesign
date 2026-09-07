import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { AREAS } from "@/data/areas";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/service-areas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...AREAS.map((a) => ({ url: `${SITE.url}/service-areas/${a.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
