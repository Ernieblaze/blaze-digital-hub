"use client";

import { BadgeCheck, Download, Flame, HeartHandshake, ShieldCheck, Smartphone } from "lucide-react";
import { SectionHeading, StaggerContainer, StaggerItem } from "@/components/site/motion";

const benefits = [
  {
    icon: Download,
    title: "Instant Download",
    text: "Pay and get your product in your email within seconds. No waiting, no stories.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Paystack Checkout",
    text: "Every payment runs through Paystack — card, transfer or USSD. Your money is safe.",
  },
  {
    icon: Flame,
    title: "Built by a Real Hustler",
    text: "No recycled foreign content. Everything is tested in the Nigerian market by Coach Ernest himself.",
  },
  {
    icon: BadgeCheck,
    title: "Premium Quality",
    text: "Professionally designed, regularly updated, and packed with actionable steps — not fluff.",
  },
  {
    icon: Smartphone,
    title: "Works on Any Device",
    text: "PDFs, templates and videos optimized for your phone. Learn and earn from anywhere.",
  },
  {
    icon: HeartHandshake,
    title: "Real Support",
    text: "Stuck? Email us and get answers from a real person, fast.",
  },
];

export function Benefits() {
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why Blaze"
          title="Why thousands trust Blaze Digital Hub"
          description="We obsess over one thing: giving you tools that actually move you forward."
        />
        <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <StaggerItem
              key={title}
              className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="mb-1.5 font-semibold">{title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
