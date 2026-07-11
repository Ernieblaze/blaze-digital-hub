"use client";

import Link from "next/link";
import { CreditCard, Inbox, MousePointerClick, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, SectionHeading, StaggerContainer, StaggerItem } from "@/components/site/motion";

const steps = [
  {
    icon: MousePointerClick,
    title: "Pick your product",
    text: "Browse the shop and choose the tool that matches your goal.",
  },
  {
    icon: CreditCard,
    title: "Pay with Paystack",
    text: "Card, bank transfer or USSD — checkout takes under a minute.",
  },
  {
    icon: Inbox,
    title: "Instant delivery",
    text: "Your download link lands in your email immediately after payment.",
  },
  {
    icon: TrendingUp,
    title: "Learn & earn",
    text: "Apply the system, track your progress, and level up your hustle.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From click to download in under a minute"
        />
        <StaggerContainer className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <StaggerItem key={title} className="relative text-center">
              {/* connector line (desktop) */}
              {i < steps.length - 1 ? (
                <div className="absolute top-8 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-primary/50 to-primary/10 lg:block" />
              ) : null}
              <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                <Icon className="size-7 text-primary" />
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-1.5 font-semibold">{title}</h3>
              <p className="mx-auto max-w-55 text-sm text-pretty text-muted-foreground">{text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Closing CTA */}
        <FadeIn className="mt-16 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-orange-600/15 via-red-600/10 to-transparent p-8 text-center sm:p-12">
          <h3 className="text-2xl font-bold text-balance sm:text-3xl">
            Ready to <span className="text-blaze">blaze your own trail</span>?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Join thousands of Nigerian students, traders and creators already using these tools.
          </p>
          <Button asChild size="lg" className="mt-7 h-12 px-8 text-base font-semibold shadow-lg shadow-orange-500/25">
            <Link href="/#shop">Start Shopping</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
