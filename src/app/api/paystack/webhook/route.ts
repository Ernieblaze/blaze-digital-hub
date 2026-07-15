/**
 * Paystack webhook — records every successful payment as an order in
 * Supabase and triggers the automatic delivery email.
 *
 * Setup (one-time): Paystack Dashboard → Settings → API Keys & Webhooks →
 * Webhook URL = https://blaze-digital-hub.vercel.app/api/paystack/webhook
 *
 * Security: Paystack signs every event with your secret key (HMAC-SHA512,
 * `x-paystack-signature` header). Anything unsigned is rejected.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { affiliateByCode } from "@/lib/affiliate";
import { getConfigNumber } from "@/lib/app-config";
import { getProducts } from "@/lib/catalog";
import { sendDeliveryEmail, sendOrderConfirmationEmail } from "@/lib/delivery";
import { sendEmail } from "@/lib/email";
import { formatNaira } from "@/lib/products";
import { siteSettings } from "@/lib/site-settings";
import { supabaseAdmin } from "@/lib/supabase";

type ChargeEvent = {
  event: string;
  data: {
    reference: string;
    amount: number; // kobo
    status: string;
    paid_at?: string | null;
    customer?: { email?: string };
    metadata?: {
      product_slug?: string;
      ref_code?: string;
      coupon_code?: string;
      custom_fields?: { variable_name?: string; value?: string }[];
    } | null;
  };
};

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new Response("Paystack not configured", { status: 503 });

  const rawBody = await request.text();

  // Verify the signature before trusting anything in the body.
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return new Response("Invalid signature", { status: 401 });

  // TEMPORARY SHARED-BUSINESS MODE: when Blaze runs on the old approved
  // Paystack business, forward every event to the RSU app's original
  // webhook (set PAYSTACK_FORWARD_URL in env) so its subscriptions keep
  // working. Remove the env var once Blaze has its own live business.
  const forwardUrl = process.env.PAYSTACK_FORWARD_URL;
  if (forwardUrl) {
    try {
      await fetch(forwardUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": signature,
        },
        body: rawBody,
      });
    } catch (error) {
      console.error("[webhook] forward to RSU failed:", error);
    }
  }

  const event = JSON.parse(rawBody) as ChargeEvent;

  // Refunds: flip the matching order's status so the books stay honest.
  if (event.event === "refund.processed") {
    const refund = event.data as unknown as { transaction_reference?: string };
    const supabase = supabaseAdmin();
    if (supabase && refund.transaction_reference) {
      await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("paystack_reference", refund.transaction_reference);
    }
    return new Response("OK", { status: 200 });
  }

  if (event.event !== "charge.success") {
    return new Response("Ignored", { status: 200 });
  }

  const { reference, amount, paid_at, customer, metadata } = event.data;
  const email = customer?.email?.toLowerCase() ?? "";

  // Identify the product: explicit metadata first, else a unique price match.
  const products = await getProducts();
  const metaSlug =
    metadata?.product_slug ??
    metadata?.custom_fields?.find((f) => f.variable_name === "product_slug")?.value;
  let product = metaSlug ? products.find((p) => p.slug === metaSlug) : undefined;
  if (!product && !metaSlug) {
    const priceMatches = products.filter((p) => p.price === amount / 100);
    if (priceMatches.length === 1) product = priceMatches[0];
  }

  // Shared-business mode: charges that aren't ours (no metadata, no price
  // match — e.g. RSU subscriptions) are forwarded above but NOT recorded
  // as Blaze orders.
  if (!product && !metaSlug) {
    return new Response("Not a store charge", { status: 200 });
  }

  // AFFILIATE COMMISSION: the ref code arrived via server-set checkout
  // metadata. Only credit it if it maps to a real affiliate who isn't the
  // buyer themselves. Percentage is admin-editable (app_config).
  let refCode: string | null = null;
  let commissionKobo = 0;
  if (metadata?.ref_code) {
    const affiliate = await affiliateByCode(metadata.ref_code);
    if (affiliate && affiliate.email !== email) {
      const percent = Math.min(90, Math.max(0, await getConfigNumber("commission_percent")));
      refCode = affiliate.ref_code;
      commissionKobo = Math.round((amount * percent) / 100);
    }
  }

  const supabase = supabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("orders").upsert(
      {
        paystack_reference: reference,
        product_slug: product?.slug ?? null,
        customer_email: email,
        amount_kobo: amount,
        status: "success",
        paid_at: paid_at ?? new Date().toISOString(),
        ref_code: refCode,
        commission_kobo: commissionKobo,
      },
      { onConflict: "paystack_reference", ignoreDuplicates: true }
    );
    if (error) console.error("[webhook] order insert failed:", error.message);
  }

  // Housekeeping (all best-effort): mark the checkout lead converted,
  // count the coupon use, and alert the owner about the sale.
  if (supabase) {
    if (product && email) {
      await supabase
        .from("checkout_leads")
        .update({ converted: true })
        .eq("email", email)
        .eq("product_slug", product.slug);
    }
    if (metadata?.coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("uses")
        .eq("code", metadata.coupon_code)
        .single();
      if (coupon) {
        await supabase
          .from("coupons")
          .update({ uses: coupon.uses + 1 })
          .eq("code", metadata.coupon_code);
      }
    }
  }
  // Awaited: unawaited promises can be dropped when the serverless
  // instance freezes after the response. Failure is still non-fatal.
  try {
    await sendEmail({
      to: siteSettings.contactEmail,
      subject: `💰 Sale: ${product?.name ?? "a product"} — ${formatNaira(amount / 100)}`,
      html: `<p><strong>${email}</strong> just paid <strong>${formatNaira(amount / 100)}</strong> for <strong>${product?.name ?? "unknown product"}</strong> (ref ${reference}).${metadata?.ref_code ? ` Referred by code ${metadata.ref_code}.` : ""}</p>`,
    });
  } catch (error) {
    console.error("[webhook] sale alert failed:", error);
  }

  // Fire the delivery email (best-effort — the order record above is the
  // source of truth either way). If the product has no download link yet,
  // send an order confirmation instead so the buyer never gets silence.
  if (product && email) {
    if (product.downloadUrl) {
      const delivered = await sendDeliveryEmail(email, product);
      if (supabase && delivered) {
        await supabase
          .from("orders")
          .update({ delivered_at: new Date().toISOString() })
          .eq("paystack_reference", reference);
      }
    } else {
      await sendOrderConfirmationEmail(email, product);
    }
  }

  return new Response("OK", { status: 200 });
}
