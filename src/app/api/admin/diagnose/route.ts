/**
 * Owner-only diagnostics for the shared Paystack business: lists recent
 * gateway transactions with their metadata so store purchases can be told
 * apart from RSU charges, and flags successful store purchases that never
 * made it into the orders table (missed webhooks).
 *
 * POST with ?repair=1 re-records those missed orders and sends the buyer
 * their delivery email.
 *
 * Auth: admin session cookie, or the temporary ORDERS_RESET_TOKEN header
 * (normally unset — see reset-orders/route.ts).
 */

import { timingSafeEqual } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
import { getProducts } from "@/lib/catalog";
import { sendDeliveryEmail } from "@/lib/delivery";
import { supabaseAdmin } from "@/lib/supabase";

function tokenAuthorized(request: Request): boolean {
  const expected = process.env.ORDERS_RESET_TOKEN?.trim();
  if (!expected) return false;
  const given = request.headers.get("x-reset-token") ?? "";
  return (
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

type Tx = {
  reference: string;
  amount: number;
  status: string;
  channel: string;
  paid_at: string | null;
  created_at: string;
  customer: { email: string };
  metadata?: { product_slug?: string; coupon_code?: string; ref_code?: string } | null;
};

async function analyze() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack not configured");

  const res = await fetch("https://api.paystack.co/transaction?perPage=50", {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const json = (await res.json()) as { status: boolean; data: Tx[] };
  if (!json.status) throw new Error("Paystack transaction list failed");

  const products = await getProducts();
  const supabase = supabaseAdmin();
  const { data: orderRows } = supabase
    ? await supabase.from("orders").select("paystack_reference")
    : { data: [] };
  const recorded = new Set((orderRows ?? []).map((o) => o.paystack_reference));

  const transactions = json.data.map((t) => {
    const slug = t.metadata?.product_slug ?? null;
    const isStore = Boolean(slug && products.some((p) => p.slug === slug));
    return {
      reference: t.reference,
      email: t.customer?.email ?? "",
      amount_naira: t.amount / 100,
      status: t.status,
      channel: t.channel,
      paid_at: t.paid_at ?? t.created_at,
      product_slug: slug,
      coupon_code: t.metadata?.coupon_code ?? null,
      classification: isStore ? "store" : "not-store (RSU/other)",
      in_orders_table: recorded.has(t.reference),
    };
  });

  const missed = transactions.filter(
    (t) => t.classification === "store" && t.status === "success" && !t.in_orders_table
  );
  return { transactions, missed, products };
}

export async function GET(request: Request) {
  if (!tokenAuthorized(request) && !(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { transactions, missed } = await analyze();
    return Response.json({ missedStoreOrders: missed, transactions });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!tokenAuthorized(request) && !(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (new URL(request.url).searchParams.get("repair") !== "1") {
    return Response.json({ error: "Pass ?repair=1 to re-record missed orders" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  if (!supabase) return Response.json({ error: "Supabase not configured" }, { status: 503 });

  try {
    const { missed, products } = await analyze();
    const repaired: { reference: string; email: string; delivered: boolean }[] = [];
    for (const t of missed) {
      const product = products.find((p) => p.slug === t.product_slug);
      const email = t.email.toLowerCase();
      const { error } = await supabase.from("orders").upsert(
        {
          paystack_reference: t.reference,
          product_slug: t.product_slug,
          customer_email: email,
          amount_kobo: Math.round(t.amount_naira * 100),
          status: "success",
          paid_at: t.paid_at,
        },
        { onConflict: "paystack_reference", ignoreDuplicates: true }
      );
      if (error) return Response.json({ error: error.message, repaired }, { status: 500 });

      let delivered = false;
      if (product?.downloadUrl && email) {
        delivered = await sendDeliveryEmail(email, product);
        if (delivered) {
          await supabase
            .from("orders")
            .update({ delivered_at: new Date().toISOString() })
            .eq("paystack_reference", t.reference);
        }
      }
      repaired.push({ reference: t.reference, email, delivered });
    }
    return Response.json({ repaired });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
