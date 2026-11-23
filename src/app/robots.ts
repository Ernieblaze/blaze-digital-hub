import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Keep in sync with metadataBase in layout.tsx.
const BASE = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
