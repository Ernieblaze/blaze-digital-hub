/**
 * "Continue with Google" — SERVER ONLY, zero dependencies.
 *
 * Flow (standard OAuth 2.0 authorization code):
 * 1. /api/auth/google sends the visitor to Google's consent screen with a
 *    signed random `state` (CSRF protection) stored in a short-lived cookie.
 * 2. Google redirects back to /api/auth/google/callback?code=…&state=….
 * 3. We verify the state, exchange the code for tokens directly with
 *    Google's token endpoint (server-to-server over TLS), and read the
 *    verified email from the id_token payload.
 * 4. That email gets the SAME buyer cookie as the email-code login — one
 *    account per email, no matter which door was used.
 *
 * Env: GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (from Google Cloud Console
 * → Credentials → OAuth client ID, Web application). The redirect URI must
 * be listed there exactly.
 */

import { createHash, randomBytes } from "node:crypto";

export const GOOGLE_STATE_COOKIE = "blaze_gstate";

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function redirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export function newState() {
  return randomBytes(16).toString("hex");
}

/** The state cookie stores a hash so the callback can verify without a DB. */
export function hashState(state: string) {
  return createHash("sha256")
    .update(`${state}:${process.env.ADMIN_PASSWORD ?? "no-secret"}`)
    .digest("hex");
}

export function googleAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchanges the auth code for tokens and returns the user's verified email.
 * The id_token comes straight from Google's token endpoint over TLS, so its
 * payload is trusted without local signature verification.
 */
export async function googleEmailFromCode(
  origin: string,
  code: string
): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    console.error("[google] token exchange failed:", res.status, await res.text());
    return null;
  }

  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64url").toString("utf8")
    ) as { email?: string; email_verified?: boolean };
    if (!payload.email || payload.email_verified === false) return null;
    return payload.email.toLowerCase();
  } catch {
    return null;
  }
}
