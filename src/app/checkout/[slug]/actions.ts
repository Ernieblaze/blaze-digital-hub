"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { REF_COOKIE } from "@/lib/affiliate";
import { getProductBySlug } from "@/lib/catalog";
import { rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";

export type CheckoutState = { error: string } | null;

/**
 * Starts a tracked Paystack transaction via the initialize API.
 * Metadata carries the product slug (exact attribution — no more price
 * matching) and the referral code from the visitor's cookie, which the
 * webhook uses to credit the affiliate.
 */
export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const slug = String(formData.get("slug") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email — your product is delivered there." };
  }
  if (!rateLimit(`checkout:${email}`, 10)) {
    return { error: "Too many attempts — wait a few minutes." };
  }

  const product = await getProductBySlug(slug);
  if (!product) return { error: "Product not found." };

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    // No API key — fall back to the hosted payment page (untracked referral).
    if (!product.paystackUrl.includes("REPLACE")) redirect(product.paystackUrl);
    return { error: "Checkout isn't configured yet — email us to buy directly." };
  }

  const cookieStore = await cookies();
  const refCode = cookieStore.get(REF_COOKIE)?.value ?? null;
  const supabase = supabaseAdmin();

  // Lead capture: they told us what they want and where to reach them.
  // If they don't finish paying, this shows up in /admin/leads for follow-up
  // (the webhook flips it to "converted" when payment succeeds).
  if (supabase) {
    await supabase.from("checkout_leads").insert({ email, product_slug: product.slug });
  }

  // Coupon (optional)
  let amountNaira = product.price;
  let couponCode: string | null = null;
  const couponInput = String(formData.get("coupon") ?? "").trim().toUpperCase();
  if (couponInput) {
    if (!supabase) return { error: "Coupons aren't available right now — leave it empty." };
    const { data: coupon } = await supabase
      .from("coupons")
      .select("code, percent_off, max_uses, uses, expires_at, active")
      .eq("code", couponInput)
      .single();
    const valid =
      coupon &&
      coupon.active &&
      (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
      (coupon.max_uses == null || coupon.uses < coupon.max_uses);
    if (!valid) return { error: "That coupon is invalid or expired." };
    amountNaira = Math.max(100, Math.round((product.price * (100 - coupon.percent_off)) / 100));
    couponCode = coupon.code;
  }

  let authorizationUrl: string | null = null;
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: amountNaira * 100, // kobo
        currency: "NGN",
        callback_url: "https://blaze-digital-hub.vercel.app/thank-you",
        metadata: {
          product_slug: product.slug,
          ...(refCode ? { ref_code: refCode } : {}),
          ...(couponCode ? { coupon_code: couponCode } : {}),
          custom_fields: [
            {
              display_name: "Product",
              variable_name: "product_slug",
              value: product.slug,
            },
          ],
        },
      }),
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string };
    };
    if (!json.status || !json.data?.authorization_url) {
      console.error("[checkout] initialize failed:", json.message);
      return { error: "Couldn't start the payment — try again in a moment." };
    }
    authorizationUrl = json.data.authorization_url;
  } catch (error) {
    console.error("[checkout] initialize error:", error);
    return { error: "Couldn't reach Paystack — check your connection and retry." };
  }

  redirect(authorizationUrl);
}
