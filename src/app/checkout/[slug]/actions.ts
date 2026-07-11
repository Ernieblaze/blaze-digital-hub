"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { REF_COOKIE } from "@/lib/affiliate";
import { getProductBySlug } from "@/lib/catalog";
import { rateLimit } from "@/lib/rate-limit";

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
    return { error: "Checkout isn't configured yet — message us on WhatsApp to buy." };
  }

  const cookieStore = await cookies();
  const refCode = cookieStore.get(REF_COOKIE)?.value ?? null;

  let authorizationUrl: string | null = null;
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: product.price * 100, // kobo
        currency: "NGN",
        callback_url: "https://blaze-digital-hub.vercel.app/thank-you",
        metadata: {
          product_slug: product.slug,
          ...(refCode ? { ref_code: refCode } : {}),
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
