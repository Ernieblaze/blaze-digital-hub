import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Banknote, Link2, Share2, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getConfigNumber } from "@/lib/app-config";
import { getProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/products";

export const metadata: Metadata = {
  title: "Become an Affiliate",
  description:
    "Earn commissions promoting Blaze Digital Hub products — get paid for every sale through your link.",
};

export default async function AffiliatesPage() {
  const [commissionPercent, minWithdrawal, products] = await Promise.all([
    getConfigNumber("commission_percent"),
    getConfigNumber("min_withdrawal_naira"),
    getProducts(),
  ]);

  const topProduct = products.reduce((a, b) => (b.price > a.price ? b : a), products[0]);
  const exampleEarning = topProduct ? Math.round((topProduct.price * commissionPercent) / 100) : 0;

  const steps = [
    {
      icon: UserPlus,
      title: "1. Log in — that's the signup",
      text: "Open your Dashboard with just your email (we send you a code, no passwords). Your affiliate account activates instantly.",
    },
    {
      icon: Link2,
      title: "2. Grab your links",
      text: "Every product gets a unique referral link with your personal code. Copy with one tap.",
    },
    {
      icon: Share2,
      title: "3. Share everywhere",
      text: "WhatsApp status, Instagram bio, Twitter, class group chats — anyone who buys through your link within 30 days counts as yours.",
    },
    {
      icon: Wallet,
      title: `4. Earn ${commissionPercent}% per sale`,
      text: `Watch your balance grow in your dashboard, then withdraw from ${formatNaira(minWithdrawal)} straight to your bank account.`,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Banknote className="size-3.5" /> Affiliate Program
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Earn <span className="text-blaze">{commissionPercent}% commission</span> on every
              sale you refer
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">
              You already share things you love — now get paid for it.
              {topProduct &&
                ` One ${topProduct.name} sale through your link = ${formatNaira(exampleEarning)} in your pocket.`}
            </p>
            <Button asChild size="lg" className="mt-8 h-12 px-8 text-base font-semibold shadow-lg shadow-orange-500/25">
              <Link href="/login">
                Start earning now <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Free to join · No approval needed · Withdraw from {formatNaira(minWithdrawal)}
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-2 text-sm text-pretty text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-primary/20 bg-gradient-to-br from-orange-600/10 via-transparent to-transparent p-8 text-center sm:p-10">
            <h2 className="text-2xl font-bold">The fine print (short version)</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-pretty text-muted-foreground">
              Commissions are credited automatically when a referred payment succeeds — you can
              watch them land in your dashboard in real time. Self-purchases through your own
              link don&apos;t earn commission. Payouts are processed manually within 48 hours of
              your withdrawal request, straight to your Nigerian bank account. Spam or
              misleading promotion gets an account closed — promote honestly and everybody
              wins. 🔥
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
