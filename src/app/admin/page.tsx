import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Mail,
  Pencil,
  Plus,
  Banknote,
  CheckCircle2,
  ExternalLink,
  Flame,
  LogOut,
  Package,
  Receipt,
  Settings,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isAdmin } from "@/lib/admin-auth";
import { getCatalog } from "@/lib/catalog";
import { isDeliveryConfigured } from "@/lib/delivery";
import { getPaystackStats, isPaystackConfigured } from "@/lib/paystack";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { formatNaira } from "@/lib/products";
import { siteSettings } from "@/lib/site-settings";
import { logout } from "./actions";
import { importCatalogToSupabase } from "./products/actions";
import { DeleteProductButton } from "./products/delete-button";
import { groupDailyRevenue, RevenueChart } from "./revenue-chart";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  robots: { index: false, follow: false },
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
          <Icon className="size-5 text-white" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-bold">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

type OrderRow = {
  paystack_reference: string;
  product_slug: string | null;
  customer_email: string;
  amount_kobo: number;
  paid_at: string;
  delivered_at: string | null;
};

async function getOrders() {
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  const { data, count, error } = await supabase
    .from("orders")
    .select("paystack_reference, product_slug, customer_email, amount_kobo, paid_at, delivered_at", {
      count: "exact",
    })
    .order("paid_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error("[admin] orders query failed:", error.message);
    return null;
  }
  return { count: count ?? 0, recent: (data ?? []) as OrderRow[] };
}

async function getChartOrders() {
  const supabase = supabaseAdmin();
  if (!supabase) return [];
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data } = await supabase
    .from("orders")
    .select("amount_kobo, paid_at")
    .eq("status", "success")
    .gte("paid_at", since.toISOString())
    .limit(2000);
  return data ?? [];
}

async function getSubscribers() {
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  const { data, count, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) {
    console.error("[admin] subscribers query failed:", error.message);
    return null;
  }
  return { count: count ?? 0, latest: data ?? [] };
}

export default async function AdminDashboardPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [stats, subscribers, orders, catalog, chartOrders] = await Promise.all([
    getPaystackStats(),
    getSubscribers(),
    getOrders(),
    getCatalog(),
    getChartOrders(),
  ]);
  const paystackReady = isPaystackConfigured();
  const supabaseReady = isSupabaseConfigured();
  const deliveryReady = isDeliveryConfigured();
  const products = catalog.products;
  const linksSet = products.filter((p) => !p.paystackUrl.includes("REPLACE")).length;
  const downloadsSet = products.filter((p) => p.downloadUrl).length;

  const checklist: { label: string; done: boolean; hint?: string }[] = [
    { label: "Paystack connected", done: paystackReady },
    { label: "Supabase connected", done: supabaseReady },
    { label: "Catalog in Supabase (phone editing)", done: catalog.source === "supabase" },
    { label: "First order recorded by webhook", done: (orders?.count ?? 0) > 0 },
    // With the internal /checkout flow, per-product payment pages are only a
    // fallback for when the Paystack API key is missing.
    ...(!paystackReady
      ? [
          {
            label: `Fallback checkout links set (${linksSet}/${products.length})`,
            done: linksSet === products.length,
            hint: "or just add PAYSTACK_SECRET_KEY — the built-in checkout needs no payment pages",
          },
        ]
      : []),
    {
      label: "Delivery emails on (Brevo)",
      done: deliveryReady,
      hint: "add BREVO_API_KEY on Vercel",
    },
    {
      label: `Download links set (${downloadsSet}/${products.length})`,
      done: downloadsSet === products.length,
      hint: "add each product's file link in its edit form",
    },
    {
      label: "Real WhatsApp number",
      done: siteSettings.whatsappNumber !== "2340000000000",
    },
  ];
  const remaining = checklist.filter((c) => !c.done).length;
  const productsWithLiveLink = products.filter((p) => !p.paystackUrl.includes("REPLACE"));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Flame className="size-5 text-white" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Owner Dashboard</h1>
            <p className="text-sm text-muted-foreground">Blaze Digital Hub — private admin view</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/settings">
              <Settings className="size-4" /> Settings
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              View site <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="size-4" /> Log out
            </Button>
          </form>
        </div>
      </div>

      {/* Quick links — handy on phones */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/orders">Orders</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/subscribers">Subscribers</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/affiliates">Affiliates</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/products/new">Add product</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/settings">Settings</Link>
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Setup checklist — hidden once everything is done */}
      {remaining > 0 && (
        <Card className="mb-8 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-base">
              Setup checklist — {checklist.length - remaining}/{checklist.length} done
            </CardTitle>
            <CardDescription>Finish these to fully automate the store.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-500" />
                  )}
                  <span className={item.done ? "text-muted-foreground line-through" : ""}>
                    {item.label}
                    {!item.done && item.hint && (
                      <span className="block text-xs text-muted-foreground">{item.hint}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sales stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Sales (live from Paystack)
        </h2>

        {!paystackReady && (
          <Card className="border-orange-500/40">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <div className="text-sm">
                <p className="font-semibold">Paystack not connected yet</p>
                <p className="text-muted-foreground">
                  Add <code className="rounded bg-muted px-1">PAYSTACK_SECRET_KEY=sk_test_…</code>{" "}
                  to <code className="rounded bg-muted px-1">.env.local</code> (find it in your{" "}
                  Paystack Dashboard → Settings → API Keys) and restart the server. Revenue,
                  sales count and recent payments will appear here automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {paystackReady && !stats && (
          <Card className="border-red-500/40">
            <CardContent className="flex items-start gap-3 p-5">
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
              <p className="text-sm">
                Couldn&apos;t reach the Paystack API. Check that your secret key is correct, then
                refresh this page.
              </p>
            </CardContent>
          </Card>
        )}

        {stats && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Banknote}
                label="Total revenue"
                value={formatNaira(stats.totalRevenue)}
                hint={`across last ${stats.totalCount} transactions`}
              />
              <StatCard icon={Receipt} label="Successful sales" value={String(stats.successfulCount)} />
              <StatCard
                icon={TrendingUp}
                label="Success rate"
                value={`${stats.successRate}%`}
                hint={`${stats.failedCount} failed`}
              />
              <StatCard
                icon={BadgeCheck}
                label="Avg. order value"
                value={formatNaira(Math.round(stats.averageOrder))}
              />
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Recent transactions</CardTitle>
                <CardDescription>Latest {stats.recent.length} payments, newest first.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {stats.recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No transactions yet — they&apos;ll show up here the moment someone pays.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Customer</th>
                        <th className="pb-2 pr-4 font-medium">Amount</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 pr-4 font-medium">Channel</th>
                        <th className="pb-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.map((t) => (
                        <tr key={t.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{t.customer.email}</td>
                          <td className="py-2 pr-4 font-medium">{formatNaira(t.amount / 100)}</td>
                          <td className="py-2 pr-4">
                            {t.status === "success" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500">
                                <CheckCircle2 className="size-3.5" /> success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-500">
                                <XCircle className="size-3.5" /> {t.status}
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-4">{t.channel}</td>
                          <td className="py-2 text-muted-foreground">
                            {new Date(t.paid_at ?? t.created_at).toLocaleString("en-NG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <Separator className="my-8" />

      {/* Orders recorded by the Paystack webhook */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Orders (recorded automatically)
          </h2>
          {supabaseReady && (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/orders">All orders &amp; export</Link>
            </Button>
          )}
        </div>
        {supabaseReady && chartOrders.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Revenue — last 30 days</CardTitle>
              <CardDescription>
                {formatNaira(chartOrders.reduce((s, o) => s + o.amount_kobo, 0) / 100)} across{" "}
                {chartOrders.length} order{chartOrders.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={groupDailyRevenue(chartOrders)} />
            </CardContent>
          </Card>
        )}
        {!supabaseReady ? (
          <Card className="border-orange-500/40">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <p className="text-sm text-muted-foreground">
                Connect Supabase to start recording orders permanently.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {orders && orders.count === 0 && (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No orders recorded yet. One-time setup: in your Paystack Dashboard →
                  Settings → API Keys &amp; Webhooks, set the Webhook URL to{" "}
                  <code className="rounded bg-muted px-1">
                    https://blaze-digital-hub.vercel.app/api/paystack/webhook
                  </code>
                  . From then on every successful payment lands here automatically
                  {isDeliveryConfigured()
                    ? " and the buyer gets their download email instantly."
                    : ". Add BREVO_API_KEY to also send automatic delivery emails."}
                </CardContent>
              </Card>
            )}
            {orders && orders.count > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {orders.count} order{orders.count === 1 ? "" : "s"} recorded
                  </CardTitle>
                  <CardDescription>Latest {orders.recent.length}, newest first.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Customer</th>
                        <th className="pb-2 pr-4 font-medium">Product</th>
                        <th className="pb-2 pr-4 font-medium">Amount</th>
                        <th className="pb-2 pr-4 font-medium">Delivered</th>
                        <th className="pb-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.recent.map((o) => (
                        <tr key={o.paystack_reference} className="border-b last:border-0">
                          <td className="py-2 pr-4">{o.customer_email}</td>
                          <td className="py-2 pr-4">{o.product_slug ?? "—"}</td>
                          <td className="py-2 pr-4 font-medium">{formatNaira(o.amount_kobo / 100)}</td>
                          <td className="py-2 pr-4">
                            {o.delivered_at ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500">
                                <CheckCircle2 className="size-3.5" /> emailed
                              </span>
                            ) : (
                              <span className="text-muted-foreground">manual</span>
                            )}
                          </td>
                          <td className="py-2 text-muted-foreground">
                            {new Date(o.paid_at).toLocaleString("en-NG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>

      <Separator className="my-8" />

      {/* Newsletter subscribers (Supabase) */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Newsletter (Supabase)
          </h2>
          {supabaseReady && (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/subscribers">All subscribers &amp; export</Link>
            </Button>
          )}
        </div>
        {!supabaseReady ? (
          <Card className="border-orange-500/40">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <div className="text-sm">
                <p className="font-semibold">Supabase not connected yet</p>
                <p className="text-muted-foreground">
                  Run <code className="rounded bg-muted px-1">supabase/schema.sql</code> in your
                  Supabase SQL Editor, then add{" "}
                  <code className="rounded bg-muted px-1">SUPABASE_URL</code> and{" "}
                  <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
                  <code className="rounded bg-muted px-1">.env.local</code> and Vercel. Footer
                  email signups will then be stored and counted here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              icon={Mail}
              label="Subscribers"
              value={String(subscribers?.count ?? 0)}
              hint="from the footer signup form"
            />
            <Card>
              <CardContent className="p-5">
                <p className="mb-2 text-sm text-muted-foreground">Latest signups</p>
                {subscribers && subscribers.latest.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {subscribers.latest.map((s) => (
                      <li key={s.email} className="truncate">{s.email}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No signups yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <Separator className="my-8" />

      {/* Product catalog overview */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Product catalog{" "}
            <span className="normal-case font-normal">
              ({catalog.source === "supabase" ? "in Supabase — edit from anywhere" : "from file"})
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {supabaseReady && catalog.source === "file" && (
              <form action={importCatalogToSupabase}>
                <Button type="submit" size="sm" variant="outline" className="font-semibold">
                  Import catalog to Supabase
                </Button>
              </form>
            )}
            <Button asChild size="sm" className="font-semibold">
              <Link href="/admin/products/new">
                <Plus className="size-4" /> Add product
              </Link>
            </Button>
          </div>
        </div>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Products live" value={String(products.length)} />
          <StatCard
            icon={BadgeCheck}
            label="Checkout links set"
            value={`${productsWithLiveLink.length} / ${products.length}`}
            hint={
              productsWithLiveLink.length === products.length
                ? "all products sellable"
                : "some still use placeholder links"
            }
          />
          <StatCard
            icon={Flame}
            label="Featured"
            value={String(products.filter((p) => p.featured).length)}
          />
          <StatCard
            icon={Banknote}
            label="Catalog value"
            value={formatNaira(products.reduce((sum, p) => sum + p.price, 0))}
            hint="sum of all product prices"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All products</CardTitle>
            <CardDescription>
              {catalog.source === "supabase"
                ? "Add, edit or delete products right here — from any device. The shop updates within a minute."
                : "Add, edit or delete products right here — changes hit the shop instantly. On the live site, connect Supabase to edit from anywhere."}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Product</th>
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium">Price</th>
                  <th className="pb-2 pr-4 font-medium">Badge</th>
                  <th className="pb-2 pr-4 font-medium">Checkout link</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const linkReady = !p.paystackUrl.includes("REPLACE");
                  return (
                    <tr key={p.slug} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium">
                        {p.name}
                        {p.featured && (
                          <Badge variant="secondary" className="ml-2 align-middle">
                            Featured
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">{p.category}</td>
                      <td className="py-2.5 pr-4">
                        {formatNaira(p.price)}
                        {p.compareAtPrice && (
                          <span className="ml-1 text-xs text-muted-foreground line-through">
                            {formatNaira(p.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">{p.badge ?? "—"}</td>
                      <td className="py-2.5 pr-4">
                        {linkReady ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500">
                            <CheckCircle2 className="size-3.5" /> ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-500">
                            <AlertTriangle className="size-3.5" /> placeholder
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          <Button asChild variant="ghost" size="sm" aria-label={`Edit ${p.name}`}>
                            <Link href={`/admin/products/${p.slug}`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <DeleteProductButton slug={p.slug} name={p.name} />
                          <Button asChild variant="ghost" size="sm" aria-label={`View ${p.name}`}>
                            <Link href={`/products/${p.slug}`}>
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Traffic insights (page views, top pages, countries) come from Vercel Analytics once the
        site is deployed — view them in your Vercel project under the Analytics tab.
      </p>
    </main>
  );
}
