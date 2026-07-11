import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { FeaturedProducts } from "@/components/site/featured-products";
import { Shop } from "@/components/site/shop";
import { Benefits } from "@/components/site/benefits";
import { Testimonials } from "@/components/site/testimonials";
import { HowItWorks } from "@/components/site/how-it-works";
import { Footer } from "@/components/site/footer";
import { siteSettings } from "@/lib/site-settings";

export default function HomePage() {
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
        <FeaturedProducts />
        <Shop />
        <Benefits />
        <Testimonials />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
