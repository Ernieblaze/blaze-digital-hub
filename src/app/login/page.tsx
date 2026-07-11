import type { Metadata } from "next";
import Link from "next/link";
import { Download, Flame, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getAffiliateStats } from "@/lib/affiliate";
import { getConfigNumber } from "@/lib/app-config";
import { buyerEmail } from "@/lib/buyer-auth";
import { getProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase";
import { buyerLogout } from "./actions";
import { AffiliatePanel } from "./affiliate-panel";
import { PortalForm } from "./portal-form";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Re-download your products and earn commissions by sharing your referral links.",
};

const SITE = "https://blaze-digital-hub.vercel.app";

type OrderRow = {
  product_slug: string | null;
  amount_kobo: number;
  paid_at: string;
};

async function ordersFor(email: string): Promise<OrderRow[]> {
  const supabase = supabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("product_slug, amount_kobo, paid_at")
    .eq("customer_email", email)
    .eq("status", "success")
    .order("paid_at", { ascending: false });
  if (error) {
    console.error("[portal] orders query failed:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function BuyerPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ google_error?: string }>;
}) {
  const { google_error } = await searchParams;
  const email = await buyerEmail();

  // The buyer's own reviews, so the form shows their existing rating.
  let myReviews = new Map<string, { rating: number; comment: string }>();
  if (email) {
    const supabase = supabaseAdmin();
    if (supabase) {
      const { data } = await supabase
        .from("reviews")
        .select("product_slug, rating, comment")
        .eq("email", email);
      myReviews = new Map((data ?? []).map((r) => [r.product_slug, r]));
    }
  }

  const [orders, products, stats, commissionPercent, minWithdrawal] = email
    ? await Promise.all([
        ordersFor(email),
        getProducts(),
        getAffiliateStats(email),
        getConfigNumber("commission_percent"),
        getConfigNumber("min_withdrawal_naira"),
      ])
    : [[], [], null, 50, 15000];

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-start justify-center px-4 pt-28 pb-20">
        <div className="w-full max-w-xl">
          <Card>
            <CardHeader className="text-center">
              <span className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                <Flame className="size-6 text-white" />
              </span>
              <CardTitle className="text-2xl">
                {email ? "My Account" : "Log in / Sign up"}
              </CardTitle>
              <CardDescription>
                {email
                  ? `Logged in as ${email}`
                  : "Enter your email and we'll send you a code — no password needed. New here? This creates your free account: re-download purchases and earn as an affiliate."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!email ? (
                <PortalForm
                  googleEnabled={Boolean(
                    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
                  )}
                  googleError={google_error}
                />
              ) : (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      <p>No purchases on this email yet.</p>
                      <p className="mt-1">
                        Bought with a different email? Log out and use the one from your
                        Paystack receipt. Either way — your affiliate account below is active:
                        share your links and start earning! 👇
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {orders.map((order) => {
                        const product = products.find((p) => p.slug === order.product_slug);
                        const review = order.product_slug
                          ? myReviews.get(order.product_slug)
                          : undefined;
                        return (
                          <li
                            key={`${order.product_slug}-${order.paid_at}`}
                            className="rounded-xl border p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="font-semibold">
                                  {product?.name ?? order.product_slug ?? "Product"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatNaira(order.amount_kobo / 100)} ·{" "}
                                  {new Date(order.paid_at).toLocaleDateString("en-NG", {
                                    dateStyle: "medium",
                                  })}
                                </p>
                              </div>
                              {product?.downloadUrl ? (
                                <Button asChild size="sm" className="shrink-0 font-semibold">
                                  <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="size-4" /> Download
                                  </a>
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Link coming — WhatsApp us for instant delivery
                                </span>
                              )}
                            </div>
                            {product && (
                              <div className="mt-2">
                                <ReviewForm
                                  slug={product.slug}
                                  existingRating={review?.rating}
                                  existingComment={review?.comment}
                                />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/#shop">
                        <ShoppingBag className="size-4" /> Shop more
                      </Link>
                    </Button>
                    <form action={buyerLogout} className="flex-1">
                      <Button type="submit" variant="outline" className="w-full">
                        <LogOut className="size-4" /> Log out
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affiliate program — every logged-in user can earn */}
          {email && stats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl">Earn with Blaze 💸</CardTitle>
                <CardDescription>
                  Share your links — when someone buys through them, you earn{" "}
                  {commissionPercent}% of the sale. Paid to your bank account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AffiliatePanel
                  refCode={stats.refCode}
                  clicks={stats.clicks}
                  bank={stats.bank}
                  totalEarned={stats.totalEarned}
                  balance={stats.balance}
                  commissionPercent={commissionPercent}
                  minWithdrawal={minWithdrawal}
                  productLinks={products.map((p) => ({
                    slug: p.slug,
                    name: p.name,
                    link: `${SITE}/r/${stats.refCode}?to=/products/${p.slug}`,
                  }))}
                  sales={stats.referredSales}
                  withdrawals={stats.withdrawals}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
