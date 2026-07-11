"use client";

import { Quote, Star } from "lucide-react";
import { SectionHeading, StaggerContainer, StaggerItem } from "@/components/site/motion";
import { products } from "@/lib/products";

/* Testimonials are pulled from each product's data so they stay in sync.
   Replace the quotes in src/lib/products.ts with real customer feedback. */
const testimonials = products.map((p) => ({ ...p.testimonial, product: p.name }));

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Real people. Real results."
          description="From first ₦100k milestones to funded trading accounts — here's what the community says."
        />
        <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem
              key={t.author}
              className="flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-orange-500/10"
            >
              <Quote className="mb-4 size-6 text-primary/50" />
              <p className="flex-1 text-sm leading-relaxed text-pretty">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex gap-0.5" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
