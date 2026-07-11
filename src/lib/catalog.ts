/**
 * Product catalog access — SERVER ONLY.
 *
 * Source of truth:
 * - Supabase `products` table when configured AND it has rows
 *   (lets the owner manage products from any device, including phone).
 * - Falls back to the bundled products-data.json otherwise, so the site
 *   always works — locally, before Supabase setup, or if the DB is down.
 *
 * Use the "Import catalog" button in /admin to copy the JSON products
 * into Supabase the first time.
 */

import { products as fileProducts, type Product } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase";

export type CatalogSource = "supabase" | "file";

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  tagline: string;
  description: string;
  whats_inside: string[];
  icon: string;
  cover: string;
  image: string | null;
  badge: string | null;
  featured: boolean;
  paystack_url: string;
  download_url: string | null;
  testimonial: Product["testimonial"];
};

function rowToProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    ...(row.compare_at_price ? { compareAtPrice: row.compare_at_price } : {}),
    tagline: row.tagline,
    description: row.description,
    whatsInside: row.whats_inside ?? [],
    icon: row.icon as Product["icon"],
    cover: row.cover,
    ...(row.image ? { image: row.image } : {}),
    ...(row.badge ? { badge: row.badge as Product["badge"] } : {}),
    ...(row.featured ? { featured: true } : {}),
    paystackUrl: row.paystack_url,
    ...(row.download_url ? { downloadUrl: row.download_url } : {}),
    testimonial: row.testimonial ?? { quote: "", author: "", role: "" },
  };
}

export function productToRow(p: Product): ProductRow {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    compare_at_price: p.compareAtPrice ?? null,
    tagline: p.tagline,
    description: p.description,
    whats_inside: p.whatsInside,
    icon: p.icon,
    cover: p.cover,
    image: p.image ?? null,
    badge: p.badge ?? null,
    featured: Boolean(p.featured),
    paystack_url: p.paystackUrl,
    download_url: p.downloadUrl ?? null,
    testimonial: p.testimonial,
  };
}

/** Full catalog plus which source served it (admin shows an import button for "file"). */
export async function getCatalog(): Promise<{ products: Product[]; source: CatalogSource }> {
  const supabase = supabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data && data.length > 0) {
      return { products: (data as ProductRow[]).map(rowToProduct), source: "supabase" };
    }
    if (error) console.error("[catalog] supabase read failed, using file:", error.message);
  }
  return { products: fileProducts, source: "file" };
}

export async function getProducts(): Promise<Product[]> {
  return (await getCatalog()).products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}
