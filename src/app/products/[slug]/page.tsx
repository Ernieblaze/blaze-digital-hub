import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Download, Quote, ShieldCheck, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ProductCover } from "@/components/site/product-cover";
import { DealCountdown } from "@/components/site/deal-countdown";
import { ProductCard } from "@/components/site/product-card";
import { FadeIn, StaggerContainer } from "@/components/site/motion";
import { formatNaira } from "@/lib/products";
import { getProductBySlug, getProducts } from "@/lib/catalog";

// Note: `params` is a Promise in Next.js 16 — always await it.
type PageProps = { params: Promise<{ slug: string }> };

// Refresh at most once a minute so admin product edits go live automatically.
export const revalidate = 60;
// Products added later (via the phone admin) render on demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    openGraph: { title: product.name, description: product.tagline },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link
            href="/#shop"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to shop
          </Link>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Cover */}
            <FadeIn>
              <div className="relative overflow-hidden rounded-2xl border shadow-2xl shadow-orange-500/10">
                <ProductCover product={product} className="aspect-[4/3] w-full" />
                {product.badge ? (
                  <Badge className="absolute top-4 left-4 border-0 bg-black/55 font-semibold text-white backdrop-blur-sm">
                    <Zap className="size-3 fill-current text-amber-400" />
                    {product.badge}
                  </Badge>
                ) : null}
              </div>
            </FadeIn>

            {/* Details */}
            <FadeIn delay={0.1} className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                {product.category}
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-0.5" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Loved by real customers</span>
              </div>

              <p className="mt-5 text-pretty text-muted-foreground">{product.description}</p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold">{formatNaira(product.price)}</span>
                {product.compareAtPrice ? (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatNaira(product.compareAtPrice)}
                    </span>
                    <Badge variant="secondary" className="font-semibold text-primary">
                      Save {formatNaira(product.compareAtPrice - product.price)}
                    </Badge>
                  </>
                ) : null}
              </div>

              {product.compareAtPrice ? <DealCountdown /> : null}

              {/*
                ── PAYSTACK CHECKOUT ──────────────────────────────────────────
                This button links to the product's Paystack Payment Page
                (set in src/lib/products.ts). For an embedded experience later,
                swap this for Paystack Inline (popup) using your public key:
                https://paystack.com/docs/payments/accept-payments/#popup
                ───────────────────────────────────────────────────────────────
              */}
              <Button
                asChild
                size="lg"
                className="mt-7 h-13 w-full text-base font-semibold shadow-lg shadow-orange-500/25 sm:w-auto sm:px-10"
              >
                <a href={product.paystackUrl} target="_blank" rel="noopener noreferrer">
                  Buy Now — Instant Delivery
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" /> Secured by Paystack
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="size-4 text-primary" /> Delivered to your email instantly
                </span>
              </div>

              <Separator className="my-8" />

              {/* What's inside */}
              <h2 className="text-lg font-semibold">What&apos;s inside</h2>
              <ul className="mt-4 space-y-3">
                {product.whatsInside.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Check className="size-3 text-primary" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          {/* Product-specific testimonial */}
          <FadeIn className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-orange-600/10 via-transparent to-transparent p-8 sm:p-10">
            <Quote className="mb-4 size-7 text-primary/50" />
            <blockquote className="max-w-3xl text-lg leading-relaxed text-pretty sm:text-xl">
              &ldquo;{product.testimonial.quote}&rdquo;
            </blockquote>
            <p className="mt-5 font-semibold">{product.testimonial.author}</p>
            <p className="text-sm text-muted-foreground">{product.testimonial.role}</p>
          </FadeIn>

          {/* Related products */}
          {related.length > 0 ? (
            <div className="mt-20">
              <h2 className="mb-8 text-2xl font-bold tracking-tight">
                More in {product.category}
              </h2>
              <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </StaggerContainer>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
