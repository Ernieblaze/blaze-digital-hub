import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BUYER_COOKIE, buyerCookieValue } from "@/lib/buyer-auth";
import {
  GOOGLE_STATE_COOKIE,
  googleEmailFromCode,
  hashState,
  isGoogleConfigured,
} from "@/lib/google-oauth";

/** Step 2: Google sends the visitor back here — verify and log them in. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?google_error=${reason}`, origin));

  if (!isGoogleConfigured()) return fail("not-configured");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_STATE_COOKIE);

  // CSRF check: the state Google echoes back must match our cookie.
  if (!code || !state || !expectedState || hashState(state) !== expectedState) {
    return fail("state");
  }

  const email = await googleEmailFromCode(origin, code);
  if (!email) return fail("exchange");

  // Same cookie as the email-code login → one account per email address.
  cookieStore.set(BUYER_COOKIE, buyerCookieValue(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  const next = cookieStore.get("blaze_gnext")?.value ?? "/login";
  cookieStore.delete("blaze_gnext");
  return NextResponse.redirect(
    new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/login", origin)
  );
}
