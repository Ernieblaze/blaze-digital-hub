import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { toggleCoupon } from "./actions";
import { CouponForm } from "./coupon-form";

export const metadata: Metadata = {
  title: "Coupons",
  robots: { index: false, follow: false },
};

type CouponRow = {
  code: string;
  percent_off: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  active: boolean;
};

export default async function AdminCouponsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const supabase = supabaseAdmin();
  let coupons: CouponRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    coupons = (data ?? []) as CouponRow[];
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Coupons</CardTitle>
          <CardDescription>
            Buyers enter the code at checkout and the discount applies instantly. Great for
            launches and for giving affiliates exclusive codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponForm />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">All coupons</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {coupons.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No coupons yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Code</th>
                  <th className="pb-2 pr-4 font-medium">Discount</th>
                  <th className="pb-2 pr-4 font-medium">Used</th>
                  <th className="pb-2 pr-4 font-medium">Expires</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.code} className="border-b last:border-0">
                    <td className="py-2.5 pr-4">
                      <code className="rounded bg-muted px-1.5 font-semibold">{c.code}</code>
                    </td>
                    <td className="py-2.5 pr-4">{c.percent_off}%</td>
                    <td className="py-2.5 pr-4">
                      {c.uses}
                      {c.max_uses ? ` / ${c.max_uses}` : ""}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString("en-NG", { dateStyle: "medium" })
                        : "never"}
                    </td>
                    <td className="py-2.5 pr-4">
                      {c.active ? (
                        <span className="text-emerald-500">active</span>
                      ) : (
                        <span className="text-muted-foreground">off</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <form action={toggleCoupon}>
                        <input type="hidden" name="code" value={c.code} />
                        <input type="hidden" name="active" value={c.active ? "1" : "0"} />
                        <Button type="submit" variant="ghost" size="sm" className="text-xs">
                          {c.active ? "deactivate" : "activate"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
