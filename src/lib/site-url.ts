/**
 * The site's public address. Set NEXT_PUBLIC_SITE_URL in Vercel when the custom
 * domain is connected (and to http://localhost:3000 in .env.local for local
 * checkout tests), so Paystack redirects, emails, SEO and download links all
 * point to the right place.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://blaze-digital-hub.vercel.app").replace(/\/+$/, "");
