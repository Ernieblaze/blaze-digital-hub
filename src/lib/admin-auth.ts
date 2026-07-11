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

export const ADMIN_COOKIE = "blaze_admin_session";

/** Token stored in the cookie after a successful login. Null when no password is configured. */
export function adminSessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash("sha256").update(`${password}:blaze-admin-v1`).digest("hex");
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin(): Promise<boolean> {
  const token = adminSessionToken();
  if (!token) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === token;
}
