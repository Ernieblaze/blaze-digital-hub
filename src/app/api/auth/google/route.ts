import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  GOOGLE_STATE_COOKIE,
  googleAuthUrl,
  hashState,
  isGoogleConfigured,
  newState,
} from "@/lib/google-oauth";

/** Step 1: send the visitor to Google's consent screen. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const state = newState();
  const cookieStore = await cookies();

  // Optional post-login destination (e.g. /admin), same-site paths only.
  const next = url.searchParams.get("next") ?? "/login";
  cookieStore.set("blaze_gnext", next.startsWith("/") && !next.startsWith("//") ? next : "/login", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  cookieStore.set(GOOGLE_STATE_COOKIE, hashState(state), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes to complete the Google screen
  });

  return NextResponse.redirect(googleAuthUrl(origin, state));
}
