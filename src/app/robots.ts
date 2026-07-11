import type { MetadataRoute } from "next";

// Keep in sync with metadataBase in layout.tsx.
const BASE = "https://blazedigitalhub.vercel.app";

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
