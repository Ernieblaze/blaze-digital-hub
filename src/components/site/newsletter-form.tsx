"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Email capture UI (front-end only for now).
 * PHASE 2: post the email to a real list — Supabase table, Mailchimp,
 * ConvertKit or Brevo — inside handleSubmit below.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-500">
        <CheckCircle2 className="size-4" /> You&apos;re on the list — talk soon! 🔥
      </p>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="Your email address"
        aria-label="Email address"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" size="sm" className="h-auto shrink-0 font-semibold">
        <Send className="size-3.5" /> Join
      </Button>
    </form>
  );
}
