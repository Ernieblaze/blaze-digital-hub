import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Banknote, CheckCircle2, Users, Wallet, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { getConfigNumber } from "@/lib/app-config";
import { formatNaira } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase";
import { markWithdrawalPaid, rejectWithdrawal } from "./actions";
import { AffiliateConfigForm } from "./config-form";

export const metadata: Metadata = {
  title: "Affiliates",
  robots: { index: false, follow: false },
};

type WithdrawalRow = {
  id: string;
  affiliate_email: string;
  amount_kobo: number;
  status: string;
  requested_at: string;
};

type AffiliateRow = {
  email: string;
  ref_code: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  created_at: string;
};

export default async function AdminAffiliatesPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const supabase = supabaseAdmin();
  const [commissionPercent, minWithdrawal] = await Promise.all([
    getConfigNumber("commission_percent"),
    getConfigNumber("min_withdrawal_naira"),
  ]);

  let totalCommissionKobo = 0;
  let totalClicks = 0;
  let paidOutKobo = 0;
  let withdrawals: WithdrawalRow[] = [];
  let affiliates: AffiliateRow[] = [];
  let overview: {
    email: string;
    ref_code: string;
    clicks: number;
    salesCount: number;
    earnedKobo: number;
    balanceKobo: number;
    hasBank: boolean;
  }[] = [];

  if (supabase) {
    const [affiliatesRes, commissionsRes, withdrawalsRes, clicksRes] = await Promise.all([
      supabase.from("affiliates").select("*").order("created_at", { ascending: true }).limit(1000),
      supabase
        .from("orders")
        .select("ref_code, commission_kobo")
        .eq("status", "success")
        .gt("commission_kobo", 0)
        .limit(5000),
      supabase
        .from("withdrawals")
        .select("*")
        .order("requested_at", { ascending: false })
        .limit(100),
      supabase.from("ref_clicks").select("ref_code").limit(20000),
    ]);

    affiliates = (affiliatesRes.data ?? []) as AffiliateRow[];
    withdrawals = (withdrawalsRes.data ?? []) as WithdrawalRow[];
    paidOutKobo = withdrawals
      .filter((w) => w.status === "paid")
      .reduce((sum, w) => sum + w.amount_kobo, 0);

    const earnedByCode = new Map<string, { total: number; count: number }>();
    for (const row of commissionsRes.data ?? []) {
      totalCommissionKobo += row.commission_kobo;
      if (row.ref_code) {
        const entry = earnedByCode.get(row.ref_code) ?? { total: 0, count: 0 };
        entry.total += row.commission_kobo;
        entry.count += 1;
        earnedByCode.set(row.ref_code, entry);
      }
    }

    const clicksByCode = new Map<string, number>();
    for (const row of clicksRes.data ?? []) {
      clicksByCode.set(row.ref_code, (clicksByCode.get(row.ref_code) ?? 0) + 1);
      totalClicks += 1;
    }

    const withdrawnByEmail = new Map<string, number>();
    for (const w of withdrawals) {
      if (w.status !== "rejected") {
        withdrawnByEmail.set(
          w.affiliate_email,
          (withdrawnByEmail.get(w.affiliate_email) ?? 0) + w.amount_kobo
        );
      }
    }

    overview = affiliates
      .map((a) => {
        const earned = earnedByCode.get(a.ref_code) ?? { total: 0, count: 0 };
        return {
          email: a.email,
          ref_code: a.ref_code,
          clicks: clicksByCode.get(a.ref_code) ?? 0,
          salesCount: earned.count,
          earnedKobo: earned.total,
          balanceKobo: earned.total - (withdrawnByEmail.get(a.email) ?? 0),
          hasBank: Boolean(a.bank_name && a.account_number),
        };
      })
      .sort((a, b) => b.earnedKobo - a.earnedKobo);
  }

  const affiliateCount = affiliates.length;
  const bankByEmail = new Map(
    affiliates.map((a) => [
      a.email,
      a.bank_name ? `${a.bank_name} · ${a.account_number} · ${a.account_name}` : null,
    ])
  );
  const pending = withdrawals.filter((w) => w.status === "pending");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Link clicks</p>
            <p className="mt-1 text-2xl font-bold">{totalClicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-4" /> Affiliates
            </p>
            <p className="mt-1 text-2xl font-bold">{affiliateCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Wallet className="size-4" /> Commissions earned
            </p>
            <p className="mt-1 text-2xl font-bold">{formatNaira(totalCommissionKobo / 100)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Banknote className="size-4" /> Paid out
            </p>
            <p className="mt-1 text-2xl font-bold">{formatNaira(paidOutKobo / 100)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending withdrawals */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">
            Withdrawal requests{pending.length > 0 ? ` — ${pending.length} pending` : ""}
          </CardTitle>
          <CardDescription>
            HOW TO PAY: send the money manually (Paystack Transfers or your bank app) to the
            affiliate, then click &ldquo;Mark paid&rdquo;. Nothing moves automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {withdrawals.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Affiliate</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 pr-4 font-medium">Requested</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-4">
                      {w.affiliate_email}
                      <span className="block text-xs text-muted-foreground">
                        {bankByEmail.get(w.affiliate_email) ?? "⚠ no bank details yet"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold">{formatNaira(w.amount_kobo / 100)}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {new Date(w.requested_at).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-2.5 pr-4">
                      {w.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="size-3.5" /> paid
                        </span>
                      ) : w.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <XCircle className="size-3.5" /> rejected
                        </span>
                      ) : (
                        <span className="text-amber-500">pending</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {w.status === "pending" && (
                        <div className="flex items-center gap-1">
                          <form action={markWithdrawalPaid}>
                            <input type="hidden" name="id" value={w.id} />
                            <Button type="submit" size="sm" className="font-semibold">
                              Mark paid
                            </Button>
                          </form>
                          <form action={rejectWithdrawal}>
                            <input type="hidden" name="id" value={w.id} />
                            <Button type="submit" size="sm" variant="ghost" className="text-red-500">
                              Reject
                            </Button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* All affiliates — full tracking */}
      {overview.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">All affiliates ({affiliateCount})</CardTitle>
            <CardDescription>
              Clicks → sales → earnings per affiliate. Conversion tells you who actually sells.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Affiliate</th>
                  <th className="pb-2 pr-4 font-medium">Code</th>
                  <th className="pb-2 pr-4 font-medium">Clicks</th>
                  <th className="pb-2 pr-4 font-medium">Sales</th>
                  <th className="pb-2 pr-4 font-medium">Conv.</th>
                  <th className="pb-2 pr-4 font-medium">Earned</th>
                  <th className="pb-2 pr-4 font-medium">Balance</th>
                  <th className="pb-2 font-medium">Bank</th>
                </tr>
              </thead>
              <tbody>
                {overview.map((a) => (
                  <tr key={a.email} className="border-b last:border-0">
                    <td className="py-2.5 pr-4">{a.email}</td>
                    <td className="py-2.5 pr-4">
                      <code className="rounded bg-muted px-1.5">{a.ref_code}</code>
                    </td>
                    <td className="py-2.5 pr-4">{a.clicks}</td>
                    <td className="py-2.5 pr-4">{a.salesCount}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {a.clicks > 0 ? `${Math.round((a.salesCount / a.clicks) * 100)}%` : "—"}
                    </td>
                    <td className="py-2.5 pr-4 font-semibold">{formatNaira(a.earnedKobo / 100)}</td>
                    <td className="py-2.5 pr-4 text-primary">{formatNaira(a.balanceKobo / 100)}</td>
                    <td className="py-2.5">
                      {a.hasBank ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-muted-foreground">not set</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Affiliate settings</CardTitle>
          <CardDescription>
            Applies instantly to new sales and withdrawal requests (stored in the database, so
            it works right here on the live site).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliateConfigForm
            commissionPercent={commissionPercent}
            minWithdrawal={minWithdrawal}
          />
        </CardContent>
      </Card>
    </main>
  );
}
