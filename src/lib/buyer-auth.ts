/**
 * Buyer portal auth — SERVER ONLY.
 *
 * Passwordless: the buyer proves they own an email by entering a 6-digit
 * code we send to it (codes live in the Supabase `login_codes` table,
 * hashed, 15-minute expiry). Success sets a signed cookie so they stay
 * logged in for 30 days.
 */

import { createHash, randomInt } from "node:crypto";
import { cookies } from "next/headers";

export const BUYER_COOKIE = "blaze_buyer";
const CODE_TTL_MINUTES = 15;

function secret() {
  // Derived from the admin password so no extra env var is needed.
  return createHash("sha256")
    .update(`${process.env.ADMIN_PASSWORD ?? "no-secret"}:buyer-v1`)
    .digest("hex");
}

export function signEmail(email: string) {
  return createHash("sha256").update(`${email}:${secret()}`).digest("hex");
}

export function buyerCookieValue(email: string) {
  return `${email}|${signEmail(email)}`;
}

/** Email of the logged-in buyer, or null. */
export async function buyerEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(BUYER_COOKIE)?.value;
  if (!raw) return null;
  const [email, sig] = raw.split("|");
  if (!email || !sig || signEmail(email) !== sig) return null;
  return email;
}

export function generateCode() {
  return String(randomInt(100000, 1000000)); // 6 digits
}

export function hashCode(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}:${secret()}`).digest("hex");
}

export function codeExpiry() {
  return new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();
}
