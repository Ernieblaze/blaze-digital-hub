/**
 * Secure, expiring download links — SERVER ONLY.
 *
 * Products whose downloadUrl starts with "private:" live in the PRIVATE
 * Supabase Storage bucket "deliverables". Buyers never see the storage URL.
 * Instead they get /download/<token>, where the token is an HMAC-signed
 * (paystack reference + expiry). The /download route re-checks that the order
 * exists, was paid and wasn't refunded, then redirects to a 2-minute signed URL.
 *
 * Products with a normal "https://…" downloadUrl keep working exactly as before.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Product } from "@/lib/products";
import { SITE_URL } from "@/lib/site-url";

export const DELIVERABLES_BUCKET = "deliverables";
const PRIVATE_PREFIX = "private:";

/** How long a link in the delivery email stays valid. */
export const EMAIL_LINK_TTL_SECONDS = 7 * 24 * 60 * 60;
/** Links shown on the thank-you page and in the buyer portal (regenerated on every visit). */
export const PAGE_LINK_TTL_SECONDS = 24 * 60 * 60;

export function isPrivateFile(product: Pick<Product, "downloadUrl">) {
  return Boolean(product.downloadUrl?.startsWith(PRIVATE_PREFIX));
}

export function privateFilePath(product: Pick<Product, "downloadUrl">) {
  return isPrivateFile(product) ? product.downloadUrl!.slice(PRIVATE_PREFIX.length).replace(/^\/+/, "") : null;
}

function secret() {
  // A dedicated secret is best; fall back to the Paystack secret so links work out of the box.
  return process.env.DOWNLOAD_TOKEN_SECRET || process.env.PAYSTACK_SECRET_KEY || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createDownloadToken(reference: string, ttlSeconds: number) {
  if (!secret()) throw new Error("Set DOWNLOAD_TOKEN_SECRET (or PAYSTACK_SECRET_KEY) to create download links.");
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = Buffer.from(JSON.stringify({ r: reference, e: exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export type TokenCheck = { ok: true; reference: string } | { ok: false; reason: "invalid" | "expired" };

export function verifyDownloadToken(token: string): TokenCheck {
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !secret()) return { ok: false, reason: "invalid" };
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "invalid" };
  try {
    const { r, e } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { r: string; e: number };
    if (typeof r !== "string" || typeof e !== "number") return { ok: false, reason: "invalid" };
    if (e < Math.floor(Date.now() / 1000)) return { ok: false, reason: "expired" };
    return { ok: true, reference: r };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

function siteUrl() {
  return SITE_URL;
}

/**
 * The link to give a buyer for this purchase.
 * - private file → signed /download/<token> link (absolute, so it works in emails)
 * - normal link  → the product's downloadUrl, unchanged
 */
export function buyerDownloadLink(product: Pick<Product, "downloadUrl">, reference: string, ttlSeconds: number) {
  if (!product.downloadUrl) return null;
  if (!isPrivateFile(product)) return product.downloadUrl;
  return `${siteUrl()}/download/${createDownloadToken(reference, ttlSeconds)}`;
}
