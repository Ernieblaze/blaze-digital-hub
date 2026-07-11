import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ProductCover } from "@/components/site/product-cover";
import { getProductBySlug } from "@/lib/catalog";
import { formatNaira } from "@/lib/products";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-start justify-center px-4 pt-28 pb-20">
        <div className="w-full max-w-md">
          <Link
            href={`/products/${product.slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to product
          </Link>
          <Card className="overflow-hidden py-0">
            <ProductCover product={product} className="aspect-[16/7] w-full" />
            <CardHeader className="pt-5">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <CardDescription className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-foreground">
                  {formatNaira(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="line-through">{formatNaira(product.compareAtPrice)}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <CheckoutForm slug={product.slug} buttonLabel={`Pay ${formatNaira(product.price)}`} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
