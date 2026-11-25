/**
 * GET /download/<token> — secure file delivery for "private:" products.
 *
 * 1. Verify the HMAC-signed token and its expiry.
 * 2. Look up the order by Paystack reference: it must exist, be "success"
 *    (not refunded) and belong to a product with a private file.
 * 3. Redirect to a Supabase signed URL that expires in 2 minutes.
 * Nothing about the storage location is ever shown to the buyer.
 */

import { supabaseAdmin } from "@/lib/supabase";
import { getProductBySlug } from "@/lib/catalog";
import { DELIVERABLES_BUCKET, privateFilePath, verifyDownloadToken } from "@/lib/secure-download";

const SIGNED_URL_SECONDS = 120;

function page(title: string, body: string, status: number) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Blaze Digital Hub</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0a09;color:#fafaf9;font-family:system-ui,sans-serif;padding:24px}
.box{max-width:440px;text-align:center}h1{font-size:24px;margin:0 0 12px}p{color:#a8a29e;line-height:1.6}
a{display:inline-block;margin-top:18px;background:#ea580c;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600}</style></head>
<body><div class="box"><h1>${title}</h1><p>${body}</p><a href="/login">Get a fresh download link</a></div></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

async function verifyWithPaystack(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !/^[\w-]+$/.test(reference)) return null;
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { status: boolean; data?: { status: string; metadata?: { product_slug?: string } | null } };
    if (!json.status || json.data?.status !== "success") return null;
    return { status: "success", product_slug: json.data.metadata?.product_slug ?? null };
  } catch {
    return null;
  }
}

export async function GET(_request: Request, ctx: RouteContext<"/download/[token]">) {
  const { token } = await ctx.params;
  const check = verifyDownloadToken(decodeURIComponent(token));
  if (!check.ok) {
    return check.reason === "expired"
      ? page("This link has expired", "For your security, download links expire. Log in with the email you paid with to get a new one instantly.", 410)
      : page("This link isn't valid", "Please use the latest link from your email, or log in with the email you paid with.", 403);
  }

  const supabase = supabaseAdmin();
  if (!supabase) return page("Downloads are temporarily unavailable", "Please try again in a few minutes.", 503);

  const { data: recorded } = await supabase
    .from("orders")
    .select("product_slug, status")
    .eq("paystack_reference", check.reference)
    .maybeSingle();

  // Right after payment the buyer can land here before the webhook has saved
  // the order. In that case confirm the payment with Paystack directly.
  const order = recorded ?? (await verifyWithPaystack(check.reference));

  if (!order || order.status !== "success" || !order.product_slug) {
    return page("We couldn't find this purchase", "If you've just paid, wait a minute and try again. Still stuck? Contact us with your payment reference.", 404);
  }

  const product = await getProductBySlug(order.product_slug);
  const path = product ? privateFilePath(product) : null;
  if (!product || !path) return page("This file isn't available", "Contact us with your payment reference and we'll send it to you.", 404);

  // Most products are PDFs; kits with extra files are ZIPs.
  const extension = path.toLowerCase().endsWith(".zip") ? "zip" : "pdf";
  const fileName = `${product.name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")}.${extension}`;
  const { data, error } = await supabase.storage
    .from(DELIVERABLES_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS, { download: fileName });
  if (error || !data?.signedUrl) {
    console.error("[download] signed URL failed:", error?.message);
    return page("Download failed", "Please try again in a moment.", 500);
  }

  return new Response(null, { status: 302, headers: { location: data.signedUrl, "cache-control": "no-store" } });
}
