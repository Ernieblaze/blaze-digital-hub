import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product cover images are pasted as URLs in the admin (Google Drive,
    // etc.), so allow any https host — the owner controls that field.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
