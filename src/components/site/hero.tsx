"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustBadges = [
  { icon: ShieldCheck, label: "Secured by Paystack" },
  { icon: Zap, label: "Instant Delivery" },
  { icon: Download, label: "Lifetime Access" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export type HeroCopy = {
  badge: string;
  headline: string;
  highlight: string;
  subline: string;
};

export function Hero({ copy }: { copy: HeroCopy }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background: grid texture + blaze glow */}
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
      <div className="absolute top-0 left-1/2 -z-10 h-105 w-full max-w-3xl -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-500/25 via-red-500/15 to-transparent blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <Sparkles className="size-3.5" />
            {copy.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl"
          >
            {copy.headline} <span className="text-blaze">{copy.highlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
            className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground"
          >
            {copy.subline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="group h-12 w-full px-7 text-base font-semibold shadow-lg shadow-orange-500/25 sm:w-auto">
              <Link href="/#shop">
                Browse Products
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 w-full px-7 text-base font-semibold backdrop-blur-sm sm:w-auto">
              <Link href="/#featured">Shop Now</Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="size-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
