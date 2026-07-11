/**
 * Verified-buyer reviews — SERVER ONLY.
 * Only emails with a successful order for the product can review it, so
 * every star on the site is real social proof.
 */

import { supabaseAdmin } from "@/lib/supabase";

export type Review = {
  product_slug: string;
  email: string;
  rating: number;
  comment: string;
  created_at: string;
};

export async function getProductReviews(
  slug: string
): Promise<{ average: number; count: number; reviews: Review[] }> {
  const supabase = supabaseAdmin();
  if (!supabase) return { average: 0, count: 0, reviews: [] };

  const { data } = await supabase
    .from("reviews")
    .select("product_slug, email, rating, comment, created_at")
    .eq("product_slug", slug)
    .order("created_at", { ascending: false })
    .limit(20);

  const reviews = (data ?? []) as Review[];
  const count = reviews.length;
  const average = count === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / count;
  return { average, count, reviews };
}

export async function hasPurchased(email: string, slug: string): Promise<boolean> {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const { count } = await supabase
    .from("orders")
    .select("paystack_reference", { count: "exact", head: true })
    .eq("customer_email", email)
    .eq("product_slug", slug)
    .eq("status", "success");
  return (count ?? 0) > 0;
}

/** Hide most of the email for public display: e***t@gmail.com */
export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "Verified buyer";
  const visible = user.slice(0, 1);
  return `${visible}${"*".repeat(Math.min(4, Math.max(2, user.length - 1)))}@${domain}`;
}
