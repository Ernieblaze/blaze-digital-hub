import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getProductBySlug } from "@/lib/catalog";
import { siteSettings } from "@/lib/site-settings";
import type { Product } from "@/lib/products";

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false, follow: false },
};

/**
 * Paystack redirects here with ?reference=… — we verify it server-side and,
 * when the product has a download link, hand it over INSTANTLY on this page
 * (the email still arrives as a keepsake).
 */
async function verifyPurchase(reference: string): Promise<Product | null> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !reference || !/^[\w-]+$/.test(reference)) return null;

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status: boolean;
      data?: { status: string; metadata?: { product_slug?: string } | null };
    };
    if (!json.status || json.data?.status !== "success") return null;
    const slug = json.data.metadata?.product_slug;
    return slug ? ((await getProductBySlug(slug)) ?? null) : null;
  } catch {
    return null;
  }
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { reference, trxref } = await searchParams;
  const product = await verifyPurchase(reference ?? trxref ?? "");

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle2 className="mx-auto mb-2 size-14 text-emerald-500" />
            <CardTitle className="text-2xl">
              {product ? `${product.name} is yours! 🔥` : "Payment received! 🔥"}
            </CardTitle>
            <CardDescription>
              {product?.downloadUrl
                ? "Verified! Grab your download right here — we've also emailed it to you for safekeeping."
                : "Your download is on its way to your email right now — check your inbox and the spam folder. You can also re-download anytime from My Downloads."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {product?.downloadUrl && (
              <Button
                asChild
                size="lg"
                className="h-12 w-full text-base font-semibold shadow-lg shadow-orange-500/25"
              >
                <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="size-4" /> Download now
                </a>
              </Button>
            )}
            <Button asChild variant={product?.downloadUrl ? "outline" : "default"} className="w-full font-semibold">
              <Link href="/login">
                <Download className="size-4" /> Open My Downloads
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={`mailto:${siteSettings.contactEmail}?subject=${encodeURIComponent("I just paid — quick question")}`}>
                <MessageCircle className="size-4" /> Need help? Email us
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
