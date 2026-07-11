import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { FeaturedProducts } from "@/components/site/featured-products";
import { Shop } from "@/components/site/shop";
import { Benefits } from "@/components/site/benefits";
import { Testimonials } from "@/components/site/testimonials";
import { HowItWorks } from "@/components/site/how-it-works";
import { Footer } from "@/components/site/footer";
import { siteSettings } from "@/lib/site-settings";
import { getProducts } from "@/lib/catalog";

// Re-render at most once a minute so product edits made from the admin
// (stored in Supabase) show up on the live site without a redeploy.
export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero
          copy={{
            badge: siteSettings.heroBadge,
            headline: siteSettings.heroHeadline,
            highlight: siteSettings.heroHighlight,
            subline: siteSettings.heroSubline,
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
