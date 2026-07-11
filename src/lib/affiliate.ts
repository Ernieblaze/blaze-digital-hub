/**
 * Affiliate program core — SERVER ONLY.
 *
 * How referrals are tracked, end to end:
 * 1. An affiliate shares links like /r/CODE?to=/products/some-product.
 * 2. That route stores CODE in a 30-day `blaze_ref` cookie and redirects.
 * 3. When the visitor checks out, /checkout passes the cookie's code into
 *    the Paystack transaction *metadata* (server-side, tamper-proof).
 * 4. The Paystack webhook reads the metadata back, verifies the code
 *    belongs to a real affiliate (and isn't the buyer referring
 *    themselves), computes the commission from the admin-set percentage,
 *    and stores both on the order row.
 * 5. Balance = sum of commissions on successful orders − withdrawals
 *    (pending + paid). Payouts are manual: the owner sends the money via
 *    Paystack/bank transfer, then marks the request "paid" in /admin.
 */

import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

export const REF_COOKIE = "blaze_ref";

/** Deterministic, URL-friendly 8-char code derived from the email. */
function refCodeFor(email: string) {
  return createHash("sha256")
    .update(`${email}:blaze-ref-v1`)
    .digest("base64url")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();
}

export type Affiliate = { email: string; ref_code: string };

/** Activates the affiliate on first use; returns their record. */
export async function getOrCreateAffiliate(email: string): Promise<Affiliate | null> {
  const supabase = supabaseAdmin();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("affiliates")
    .select("email, ref_code")
    .eq("email", email)
    .single();
  if (existing) return existing as Affiliate;

  const record = { email, ref_code: refCodeFor(email) };
  const { error } = await supabase.from("affiliates").upsert(record, { onConflict: "email" });
  if (error) {
    console.error("[affiliate] create failed:", error.message);
    return null;
  }
  return record;
}

export async function affiliateByCode(refCode: string): Promise<Affiliate | null> {
  const supabase = supabaseAdmin();
  if (!supabase || !refCode) return null;
  const { data } = await supabase
    .from("affiliates")
    .select("email, ref_code")
    .eq("ref_code", refCode)
    .single();
  return (data as Affiliate) ?? null;
}

export type AffiliateStats = {
  refCode: string;
  /** Lifetime commission earned (₦). */
  totalEarned: number;
  /** Withdrawn or awaiting payout (₦). */
  totalWithdrawn: number;
  /** Available now (₦). */
  balance: number;
  referredSales: {
    product_slug: string | null;
    amount_kobo: number;
    commission_kobo: number;
    paid_at: string;
  }[];
  withdrawals: {
    id: string;
    amount_kobo: number;
    status: string;
    requested_at: string;
  }[];
};

export async function getAffiliateStats(email: string): Promise<AffiliateStats | null> {
  const supabase = supabaseAdmin();
  if (!supabase) return null;

  const affiliate = await getOrCreateAffiliate(email);
  if (!affiliate) return null;

  const [{ data: sales }, { data: withdrawals }] = await Promise.all([
    supabase
      .from("orders")
      .select("product_slug, amount_kobo, commission_kobo, paid_at")
      .eq("ref_code", affiliate.ref_code)
      .eq("status", "success")
      .gt("commission_kobo", 0)
      .order("paid_at", { ascending: false })
      .limit(100),
    supabase
      .from("withdrawals")
      .select("id, amount_kobo, status, requested_at")
      .eq("affiliate_email", email)
      .order("requested_at", { ascending: false })
      .limit(50),
  ]);

  const totalEarnedKobo = (sales ?? []).reduce((sum, s) => sum + (s.commission_kobo ?? 0), 0);
  const totalWithdrawnKobo = (withdrawals ?? [])
    .filter((w) => w.status !== "rejected")
    .reduce((sum, w) => sum + w.amount_kobo, 0);

  return {
    refCode: affiliate.ref_code,
    totalEarned: totalEarnedKobo / 100,
    totalWithdrawn: totalWithdrawnKobo / 100,
    balance: (totalEarnedKobo - totalWithdrawnKobo) / 100,
    referredSales: sales ?? [],
    withdrawals: withdrawals ?? [],
  };
}
