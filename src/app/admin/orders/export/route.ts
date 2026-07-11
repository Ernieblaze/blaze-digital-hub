import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV export of orders, honoring the same q/product filters as the page. */
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const supabase = supabaseAdmin();
  if (!supabase) return new Response("Supabase not configured", { status: 503 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const product = url.searchParams.get("product") ?? "";

  let query = supabase
    .from("orders")
    .select("paystack_reference, customer_email, product_slug, amount_kobo, status, paid_at, delivered_at")
    .order("paid_at", { ascending: false })
    .limit(10000);
  if (q) query = query.ilike("customer_email", `%${q}%`);
  if (product) query = query.eq("product_slug", product);

  const { data, error } = await query;
  if (error) return new Response(`Query failed: ${error.message}`, { status: 500 });

  const header = "reference,customer_email,product,amount_naira,status,paid_at,delivered_at";
  const rows = (data ?? []).map((o) =>
    [
      o.paystack_reference,
      o.customer_email,
      o.product_slug ?? "",
      o.amount_kobo / 100,
      o.status,
      o.paid_at ?? "",
      o.delivered_at ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="blaze-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
