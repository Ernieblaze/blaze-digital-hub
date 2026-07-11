"use client";

import { ProductCard } from "@/components/site/product-card";
import { SectionHeading, StaggerContainer } from "@/components/site/motion";
import { featuredProducts } from "@/lib/products";

export function FeaturedProducts() {
  return (
    <section id="featured" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Featured"
          title="Bestsellers people swear by"
          description="The products moving the needle for students, traders and vendors across Nigeria right now."
        />
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
