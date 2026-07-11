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
import { getProducts } from "@/lib/catalog";
import { sendDeliveryEmail, sendOrderConfirmationEmail } from "@/lib/delivery";
import { supabaseAdmin } from "@/lib/supabase";

type ChargeEvent = {
  event: string;
  data: {
    reference: string;
    amount: number; // kobo
    status: string;
    paid_at?: string | null;
    customer?: { email?: string };
    metadata?: { custom_fields?: { variable_name?: string; value?: string }[] } | null;
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
  const metaSlug = metadata?.custom_fields?.find(
    (f) => f.variable_name === "product_slug"
  )?.value;
  let product = metaSlug ? products.find((p) => p.slug === metaSlug) : undefined;
  if (!product) {
    const priceMatches = products.filter((p) => p.price === amount / 100);
    if (priceMatches.length === 1) product = priceMatches[0];
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
      },
      { onConflict: "paystack_reference", ignoreDuplicates: true }
    );
    if (error) console.error("[webhook] order insert failed:", error.message);
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
