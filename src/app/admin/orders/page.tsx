import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { getProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/products";
import { isDeliveryConfigured } from "@/lib/delivery";
import { supabaseAdmin } from "@/lib/supabase";
import { resendDelivery, toggleDelivered } from "./actions";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

type OrderRow = {
  paystack_reference: string;
  product_slug: string | null;
  customer_email: string;
  amount_kobo: number;
  status: string;
  paid_at: string;
  delivered_at: string | null;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; product?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { q = "", product = "" } = await searchParams;
  const supabase = supabaseAdmin();
  const products = await getProducts();

  let orders: OrderRow[] = [];
  let total = 0;
  if (supabase) {
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("paid_at", { ascending: false })
      .limit(500);
    if (q) query = query.ilike("customer_email", `%${q}%`);
    if (product) query = query.eq("product_slug", product);
    const { data, count, error } = await query;
    if (!error) {
      orders = (data ?? []) as OrderRow[];
      total = count ?? 0;
    }
  }

  const revenue = orders.reduce(
    (sum, o) => (o.status === "success" ? sum + o.amount_kobo : sum),
    0
  );
  const exportHref = `/admin/orders/export?q=${encodeURIComponent(q)}&product=${encodeURIComponent(product)}`;
  const deliveryReady = isDeliveryConfigured();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Orders</CardTitle>
              <CardDescription>
                {total} matching · {formatNaira(revenue / 100)} revenue shown
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={exportHref}>
                <Download className="size-4" /> Export CSV
              </a>
            </Button>
          </div>

          {/* Filters */}
          <form className="mt-4 flex flex-col gap-2 sm:flex-row" method="GET">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search customer email…"
                className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <select
              name="product"
              defaultValue={product}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" variant="outline" className="sm:h-auto">
              Filter
            </Button>
          </form>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {!supabase ? (
            <p className="text-sm text-muted-foreground">Connect Supabase to see orders.</p>
          ) : orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No orders match. New payments appear here automatically via the Paystack webhook.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium">Product</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Delivered</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const productName =
                    products.find((p) => p.slug === o.product_slug)?.name ??
                    o.product_slug ??
                    "—";
                  return (
                    <tr key={o.paystack_reference} className="border-b last:border-0">
                      <td className="py-2.5 pr-4">{o.customer_email}</td>
                      <td className="py-2.5 pr-4">{productName}</td>
                      <td className="py-2.5 pr-4 font-medium">{formatNaira(o.amount_kobo / 100)}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {new Date(o.paid_at).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-2.5 pr-4">
                        {o.delivered_at ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500">
                            <CheckCircle2 className="size-3.5" /> yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">no</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          {deliveryReady && o.product_slug && (
                            <form action={resendDelivery}>
                              <input type="hidden" name="reference" value={o.paystack_reference} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                title="Resend delivery email"
                              >
                                <Send className="size-4" />
                              </Button>
                            </form>
                          )}
                          <form action={toggleDelivered}>
                            <input type="hidden" name="reference" value={o.paystack_reference} />
                            <input
                              type="hidden"
                              name="delivered"
                              value={o.delivered_at ? "1" : "0"}
                            />
                            <Button type="submit" variant="ghost" size="sm" className="text-xs">
                              {o.delivered_at ? "unmark" : "mark delivered"}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
