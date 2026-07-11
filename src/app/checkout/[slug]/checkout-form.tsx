"use client";

import { useActionState } from "react";
import { ArrowUpRight, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCheckout, type CheckoutState } from "./actions";

export function CheckoutForm({ slug, buttonLabel }: { slug: string; buttonLabel: string }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="email"
        name="email"
        required
        autoFocus
        placeholder="Your email (product is delivered here)"
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        type="text"
        name="coupon"
        placeholder="Coupon code (optional)"
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm uppercase outline-none placeholder:normal-case focus-visible:ring-2 focus-visible:ring-ring"
      />
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="h-12 w-full text-base font-semibold shadow-lg shadow-orange-500/25"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        {buttonLabel}
        <ArrowUpRight className="size-4" />
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Secured by Paystack — card, transfer or USSD. Instant email delivery.
      </p>
    </form>
  );
}
