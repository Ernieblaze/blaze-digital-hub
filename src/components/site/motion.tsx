"use client";

/**
 * Reusable scroll-reveal animation primitives.
 * Wrap any server-rendered content in these to get consistent,
 * subtle motion across the site without sprinkling framer-motion everywhere.
 */

import { motion, type Variants } from "framer-motion";
import type { ComponentProps } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

type MotionDivProps = ComponentProps<typeof motion.div>;

/** Fades content up into view when it scrolls into the viewport. */
export function FadeIn({ children, delay = 0, ...props }: MotionDivProps & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Parent for staggered reveals — pair with <StaggerItem>. */
export function StaggerContainer({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: MotionDivProps) {
  return (
    <motion.div variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}

/** Section heading block used across every home section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <FadeIn className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
      <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </FadeIn>
  );
}
