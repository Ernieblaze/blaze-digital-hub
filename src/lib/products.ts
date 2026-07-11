/**
 * Product catalog for Blaze Digital Hub.
 *
 * ── WHERE THE DATA LIVES ───────────────────────────────────────────────────
 * All products are stored in `src/lib/products-data.json`. Manage them the
 * easy way from the owner dashboard (/admin → Product catalog → Add/Edit/
 * Delete) — it reads and writes that JSON file. You can also edit the JSON
 * by hand. After changing products, commit & push to update the live site.
 * ───────────────────────────────────────────────────────────────────────────
 */

import productsData from "./products-data.json";
import categoriesData from "./categories-data.json";

/** Product categories — managed from /admin/settings, stored in categories-data.json. */
export const productCategories: string[] = categoriesData;

/** Categories including the "All" filter pill for the shop. */
export const categories: string[] = ["All", ...categoriesData];

export type Category = string;

export const productIcons = [
  "candlestick",
  "graduation",
  "palette",
  "rocket",
  "notebook",
  "coins",
] as const;

/** Tailwind gradient presets for generated cover art (label → classes). */
export const coverPresets = [
  "from-orange-600 via-red-600 to-rose-700",
  "from-amber-500 via-orange-500 to-red-600",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-rose-500 via-red-500 to-orange-600",
  "from-red-600 via-orange-600 to-amber-500",
  "from-orange-500 via-red-500 to-rose-600",
] as const;

export type Product = {
  slug: string;
  name: string;
  category: Category;
  /** Price in Naira (whole number). */
  price: number;
  /** Optional strikethrough price to show the deal. */
  compareAtPrice?: number;
  tagline: string;
  description: string;
  whatsInside: string[];
  /** Lucide icon name used on the generated cover art. */
  icon: (typeof productIcons)[number];
  /** Tailwind gradient classes for the generated cover art. */
  cover: string;
  /**
   * Optional real cover image, e.g. "/products/my-product.jpg".
   * Drop the file into public/products/ and set this path (from the admin
   * product form). When set, it replaces the generated gradient cover.
   */
  image?: string;
  badge?: "Bestseller" | "New" | "Hot Deal";
  featured?: boolean;
  /**
   * PAYSTACK INTEGRATION POINT:
   * The product's Paystack Payment Page URL.
   * Every "Buy Now" button in the app links here.
   */
  paystackUrl: string;
  testimonial: { quote: string; author: string; role: string };
};

export const products = productsData as Product[];

export const featuredProducts = products.filter((p) => p.featured);

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

/** Format a Naira amount: 15000 → "₦15,000" */
export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
