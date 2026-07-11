"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribe, type SubscribeState } from "@/app/newsletter-actions";

/**
 * Email capture — stores signups in the Supabase `newsletter_subscribers`
 * table (see supabase/schema.sql). Degrades gracefully if Supabase isn't
 * configured yet.
 */
export function NewsletterForm() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);

  if (state?.ok) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-500">
        <CheckCircle2 className="size-4" /> You&apos;re on the list — talk soon! 🔥
      </p>
    );
  }

  return (
    <div>
      <form action={action} className="flex w-full max-w-sm gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          aria-label="Email address"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" disabled={pending} size="sm" className="h-auto shrink-0 font-semibold">
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Join
        </Button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-500">{state.error}</p>}
    </div>
  );
}
