import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ProductCard } from "@/components/site/product-card";
import { getProducts } from "@/lib/catalog";
import { siteSettings } from "@/lib/site-settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about delivery, payments, refunds and updates at Blaze Digital Hub.",
};

const faqs = [
  {
    q: "How do I receive my product after paying?",
    a: "Instantly. The moment your Paystack payment succeeds, your download is delivered to the email address you entered at checkout. Check your inbox (and the spam/promotions folder) within a few minutes.",
  },
  {
    q: "What payment methods can I use?",
    a: "Everything Paystack supports in Nigeria: debit cards (Verve, Mastercard, Visa), bank transfer, USSD and bank accounts. Payments are fully secured by Paystack — we never see or store your card details.",
  },
  {
    q: "I paid but didn't get my product. What do I do?",
    a: `First check your spam/promotions folder and confirm the email you entered at checkout. Still nothing after 30 minutes? Email us at ${siteSettings.contactEmail} with your payment reference and we'll resend it immediately.`,
  },
  {
    q: "Do I get updates when a product is improved?",
    a: "Yes — lifetime updates are included. Whenever a guide gets a new edition (new strategies, new past questions, new templates), you receive the update at no extra cost.",
  },
  {
    q: "Can I get a refund?",
    a: "Because these are instantly-delivered digital products, all sales are final once the download has been delivered. But if you were double-charged, or the product was not delivered, or the content is materially different from what was described, contact us within 7 days and we'll make it right. See our full Refund Policy.",
  },
  {
    q: "Can I share my copy with friends?",
    a: "Each purchase is a personal license for one person. Sharing or reselling the files kills the hustle that keeps these products updated — and honestly, your friend can afford ₦5k. Bulk/group licenses are available on request via WhatsApp.",
  },
  {
    q: "Do the products work outside Nigeria?",
    a: "The trading and design products work anywhere. The JAMB pack and some hustle blueprints are built specifically for the Nigerian context — that's their superpower.",
  },
  {
    q: "Can I earn money promoting your products?",
    a: "Yes — our affiliate program pays you a commission on every sale made through your personal referral links. Log in to your Dashboard with just your email, copy your links, share them anywhere, and withdraw your earnings to your bank account. See the Become an Affiliate page for details.",
  },
  {
    q: "How do I contact support?",
    a: `Fastest: WhatsApp. You can also email ${siteSettings.contactEmail}. Real humans reply — usually within a few hours.`,
  },
];

export default async function FaqPage() {
  const featured = (await getProducts()).filter((p) => p.featured).slice(0, 3);
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently asked <span className="text-blaze">questions</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Everything about delivery, payments and updates. Can&apos;t find your answer?
            Email us — we reply fast.
          </p>

          <div className="mt-10 space-y-4">
            {faqs.map(({ q, a }) => (
              <Card key={q}>
                <CardContent className="p-6">
                  <h2 className="font-semibold">{q}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="font-semibold shadow-lg shadow-orange-500/25">
              <a href={`mailto:${siteSettings.contactEmail}?subject=${encodeURIComponent("Question about Blaze Digital Hub")}`}>
                <MessageCircle className="size-4" /> Email us — {siteSettings.contactEmail}
              </a>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Also see our <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>,{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          {featured.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-center text-xl font-bold">While you&apos;re here 🔥</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
