"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAffiliateConfig, type AffiliateConfigState } from "./actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AffiliateConfigForm({
  commissionPercent,
  minWithdrawal,
}: {
  commissionPercent: number;
  minWithdrawal: number;
}) {
  const [state, action, pending] = useActionState<AffiliateConfigState, FormData>(
    saveAffiliateConfig,
    null
  );

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-sm font-medium">Commission (%)</span>
          <input
            name="commission_percent"
            type="number"
            min="0"
            max="90"
            defaultValue={commissionPercent}
            className={inputClass}
          />
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium">Minimum withdrawal (₦)</span>
          <input
            name="min_withdrawal_naira"
            type="number"
            min="100"
            step="100"
            defaultValue={minWithdrawal}
            className={inputClass}
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-500">Saved — applies immediately.</p>}
      <Button type="submit" disabled={pending} size="sm" className="font-semibold">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save affiliate settings
      </Button>
    </form>
  );
}
