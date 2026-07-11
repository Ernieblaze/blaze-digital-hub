import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

/** CSV export of newsletter subscribers (import into any email tool). */
export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const supabase = supabaseAdmin();
  if (!supabase) return new Response("Supabase not configured", { status: 503 });

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(50000);
  if (error) return new Response(`Query failed: ${error.message}`, { status: 500 });

  const rows = (data ?? []).map((s) => `${s.email},${s.source},${s.created_at}`);
  return new Response(["email,source,created_at", ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="blaze-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
