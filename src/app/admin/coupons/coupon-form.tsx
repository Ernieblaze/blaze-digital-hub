"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCoupon, type CouponFormState } from "./actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CouponForm() {
  const [state, action, pending] = useActionState<CouponFormState, FormData>(createCoupon, null);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <span className="mb-1 block text-sm font-medium">Code</span>
          <input name="code" required placeholder="LAUNCH20" className={`${inputClass} uppercase`} />
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium">% off</span>
          <input name="percent_off" type="number" min="1" max="90" required placeholder="20" className={inputClass} />
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium">Max uses (blank = unlimited)</span>
          <input name="max_uses" type="number" min="1" placeholder="100" className={inputClass} />
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium">Expires (blank = never)</span>
          <input name="expires_at" type="date" className={inputClass} />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-500">Coupon created — share it!</p>}
      <Button type="submit" disabled={pending} size="sm" className="font-semibold">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Create coupon
      </Button>
    </form>
  );
}
