"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Banknote,
  Check,
  Copy,
  Landmark,
  Loader2,
  MessageCircle,
  MousePointerClick,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/products";
import {
  requestWithdrawal,
  updateBankDetails,
  type BankState,
  type WithdrawState,
} from "./actions";

type ProductLink = { slug: string; name: string; link: string };
type Bank = { bank_name: string; account_number: string; account_name: string } | null;
type Sale = { product_slug: string | null; amount_kobo: number; commission_kobo: number; paid_at: string };
type Withdrawal = { id: string; amount_kobo: number; status: string; requested_at: string };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="shrink-0"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

export function AffiliatePanel({
  refCode,
  clicks,
  bank,
  totalEarned,
  balance,
  commissionPercent,
  minWithdrawal,
  productLinks,
  sales,
  withdrawals,
}: {
  refCode: string;
  clicks: number;
  bank: Bank;
  totalEarned: number;
  balance: number;
  commissionPercent: number;
  minWithdrawal: number;
  productLinks: ProductLink[];
  sales: Sale[];
  withdrawals: Withdrawal[];
}) {
  const [state, action, pending] = useActionState<WithdrawState, FormData>(requestWithdrawal, null);
  const [bankState, bankAction, bankPending] = useActionState<BankState, FormData>(
    updateBankDetails,
    null
  );
  const [editingBank, setEditingBank] = useState(false);
  useEffect(() => {
    if (bankState?.ok) setEditingBank(false);
  }, [bankState]);
  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MousePointerClick className="size-3.5" /> Link clicks
          </p>
          <p className="mt-1 text-xl font-bold">{clicks}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" /> Total earned
          </p>
          <p className="mt-1 text-xl font-bold">{formatNaira(totalEarned)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="size-3.5" /> Balance
          </p>
          <p className="mt-1 text-xl font-bold text-primary">{formatNaira(balance)}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        You earn <strong className="text-foreground">{commissionPercent}%</strong> on every sale
        through your links. Your code: <code className="rounded bg-muted px-1.5 font-semibold">{refCode}</code>
      </p>

      {/* Referral links */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Your referral links</h3>
        <ul className="space-y-2">
          {productLinks.map((p) => (
            <li key={p.slug} className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.link}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button asChild size="sm" variant="outline" aria-label={`Share ${p.name} on WhatsApp`}>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`🔥 Check out ${p.name} on Blaze Digital Hub — instant delivery! ${p.link}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-3.5 text-[#25D366]" />
                  </a>
                </Button>
                <CopyButton text={p.link} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Referred sales */}
      {sales.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Your referred sales</h3>
          <ul className="space-y-1.5 text-sm">
            {sales.slice(0, 10).map((s, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="truncate">{s.product_slug ?? "product"}</span>
                <span className="shrink-0 font-semibold text-emerald-500">
                  +{formatNaira(s.commission_kobo / 100)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bank details — required before withdrawals */}
      <div className="rounded-xl border p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Landmark className="size-4 text-primary" /> Payout bank account
        </h3>
        {bank && !editingBank ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              {bank.bank_name} · {bank.account_number} ·{" "}
              <span className="text-foreground">{bank.account_name}</span>
            </p>
            <Button size="sm" variant="outline" onClick={() => setEditingBank(true)}>
              Edit
            </Button>
          </div>
        ) : (
          <form action={bankAction} className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-3">
              <input name="bank_name" required placeholder="Bank (e.g. Opay, GTBank)" defaultValue={bank?.bank_name} className={inputClass} />
              <input name="account_number" required inputMode="numeric" pattern="\d{10}" maxLength={10} placeholder="Account number" defaultValue={bank?.account_number} className={inputClass} />
              <input name="account_name" required placeholder="Account name" defaultValue={bank?.account_name} className={inputClass} />
            </div>
            {bankState?.error && <p className="text-sm text-red-500">{bankState.error}</p>}
            <Button type="submit" size="sm" disabled={bankPending} className="font-semibold">
              {bankPending ? <Loader2 className="size-4 animate-spin" /> : null} Save bank details
            </Button>
          </form>
        )}
        {bankState?.ok && !editingBank && (
          <p className="mt-2 text-sm text-emerald-500">Saved — withdrawals unlocked.</p>
        )}
      </div>

      {/* Withdrawal */}
      <div className="rounded-xl border p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Banknote className="size-4 text-primary" /> Request withdrawal
        </h3>
        {state?.ok ? (
          <p className="text-sm text-emerald-500">
            Request submitted! We process payouts manually within 48 hours — you&apos;ll receive
            it via bank transfer.
          </p>
        ) : (
          <form action={action} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="number"
              name="amount"
              min={minWithdrawal}
              step="100"
              required
              placeholder={`Amount (min ₦${minWithdrawal.toLocaleString("en-NG")})`}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" disabled={pending || balance < minWithdrawal} className="shrink-0 font-semibold">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null} Withdraw
            </Button>
          </form>
        )}
        {state?.error && <p className="mt-2 text-sm text-red-500">{state.error}</p>}
        {balance < minWithdrawal && !state?.ok && (
          <p className="mt-2 text-xs text-muted-foreground">
            Minimum withdrawal is ₦{minWithdrawal.toLocaleString("en-NG")} — keep sharing your
            links to build your balance!
          </p>
        )}
      </div>

      {/* Withdrawal history */}
      {withdrawals.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Withdrawal history</h3>
          <ul className="space-y-1.5 text-sm">
            {withdrawals.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>{new Date(w.requested_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span>
                <span className="font-medium">{formatNaira(w.amount_kobo / 100)}</span>
                <span
                  className={
                    w.status === "paid"
                      ? "text-emerald-500"
                      : w.status === "rejected"
                        ? "text-red-500"
                        : "text-amber-500"
                  }
                >
                  {w.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
