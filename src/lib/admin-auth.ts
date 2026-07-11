/**
 * Owner-only auth for the /admin dashboard — SERVER ONLY.
 *
 * Phase-1 approach: a single ADMIN_PASSWORD env var. A correct login sets an
 * httpOnly cookie holding a hash derived from the password, so changing the
 * password in .env instantly invalidates old sessions. Upgrade to Auth.js or
 * Clerk when the buyer dashboard (phase 2) lands.
 */

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { buyerEmail } from "@/lib/buyer-auth";

export const ADMIN_COOKIE = "blaze_admin_session";

/**
 * The configured password, trimmed — pasting into Vercel's env UI can leave
 * an invisible trailing space/newline that would otherwise reject every login.
 */
export function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

/** Token stored in the cookie after a successful login. Null when no password is configured. */
export function adminSessionToken(): string | null {
  const password = adminPassword();
  if (!password) return null;
  return createHash("sha256").update(`${password}:blaze-admin-v1`).digest("hex");
}

export function isAdminConfigured() {
  return Boolean(adminPassword());
}

/** Emails allowed to open /admin via Google sign-in (env ADMIN_EMAILS, comma-separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  // Door 1: the password session cookie.
  const token = adminSessionToken();
  if (token) {
    const cookieStore = await cookies();
    if (cookieStore.get(ADMIN_COOKIE)?.value === token) return true;
  }
  // Door 2: a Google/buyer session whose email is on the ADMIN_EMAILS list.
  const allowed = adminEmails();
  if (allowed.length > 0) {
    const email = await buyerEmail();
    if (email && allowed.includes(email)) return true;
  }
  return false;
}
