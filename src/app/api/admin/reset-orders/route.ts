/**
 * Owner-only maintenance: wipe the order history so analytics start fresh
 * (e.g. after test purchases during setup). The full table is returned in
 * the response as a backup before anything is deleted.
 *
 * Auth: the normal admin session cookie, or — for one-off remote runs — a
 * matching ORDERS_RESET_TOKEN env var sent as the x-reset-token header.
 * Leave that env var unset in normal operation.
 */

import { timingSafeEqual } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
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

export async function POST(request: Request) {
  if (!tokenAuthorized(request) && !(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: backup, error: readError } = await supabase
    .from("orders")
    .select("*")
    .order("paid_at", { ascending: false })
    .limit(10000);
  if (readError) {
    return Response.json({ error: readError.message }, { status: 500 });
  }

  const { error: deleteError, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .not("paystack_reference", "is", null);
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ deleted: count ?? 0, backup });
}
