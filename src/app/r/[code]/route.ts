/**
 * Referral entry point: /r/CODE?to=/products/some-product
 * Stores the code in a 30-day cookie, then redirects to the target page.
 * The checkout reads the cookie server-side and bakes the code into the
 * Paystack transaction metadata — the browser can't tamper with payouts.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REF_COOKIE } from "@/lib/affiliate";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const url = new URL(request.url);
  const to = url.searchParams.get("to") ?? "/";
  // Only allow same-site relative redirects.
  const target = to.startsWith("/") && !to.startsWith("//") ? to : "/";

  const cookieStore = await cookies();
  if (/^[A-Z0-9]{4,16}$/i.test(code)) {
    // Count the click. Must be awaited: on serverless, returning the
    // redirect first can kill the instance before the insert lands.
    const supabase = supabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from("ref_clicks")
        .insert({ ref_code: code.toUpperCase() });
      if (error) console.error("[ref] click log failed:", error.message);
    }
    cookieStore.set(REF_COOKIE, code.toUpperCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return NextResponse.redirect(new URL(target, url.origin));
}
