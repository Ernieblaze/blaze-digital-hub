import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { FeaturedProducts } from "@/components/site/featured-products";
import { Shop } from "@/components/site/shop";
import { Benefits } from "@/components/site/benefits";
import { Testimonials } from "@/components/site/testimonials";
import { HowItWorks } from "@/components/site/how-it-works";
import { Footer } from "@/components/site/footer";
import { getAllConfig } from "@/lib/app-config";
import { getProducts } from "@/lib/catalog";

// Re-render at most once a minute so product and content edits made from
// the admin (stored in Supabase) show up on the live site without a redeploy.
export const revalidate = 60;

export default async function HomePage() {
  const [products, content] = await Promise.all([getProducts(), getAllConfig()]);
  return (
    <>
      <Navbar announcement={content.announcement} />
      <main className="flex-1">
        <Hero
          copy={{
            badge: content.hero_badge,
            headline: content.hero_headline,
            highlight: content.hero_highlight,
            subline: content.hero_subline,
          }}
        />
        <FeaturedProducts products={products} />
        <Shop products={products} />
        <Benefits />
        <Testimonials products={products} />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
