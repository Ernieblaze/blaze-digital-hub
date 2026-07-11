import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { getProducts } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Checkout Leads",
  robots: { index: false, follow: false },
};

type LeadRow = {
  id: string;
  email: string;
  product_slug: string;
  converted: boolean;
  created_at: string;
};

export default async function AdminLeadsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const supabase = supabaseAdmin();
  const products = await getProducts();
  let leads: LeadRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("checkout_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    leads = (data ?? []) as LeadRow[];
  }

  // One row per email+product, newest first (someone may retry checkout).
  const seen = new Set<string>();
  const unique = leads.filter((l) => {
    const key = `${l.email}:${l.product_slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const hot = unique.filter((l) => !l.converted);

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
          <CardTitle className="text-xl">
            Checkout leads{hot.length > 0 ? ` — ${hot.length} to follow up` : ""}
          </CardTitle>
          <CardDescription>
            People who entered their email at checkout. The ones NOT converted wanted to buy
            and stopped at payment — a friendly email nudge recovers many of these.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {unique.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No leads yet — they appear as soon as someone starts a checkout.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Wanted</th>
                  <th className="pb-2 pr-4 font-medium">When</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {unique.map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-4">
                      <a href={`mailto:${l.email}`} className="hover:text-primary hover:underline">
                        {l.email}
                      </a>
                    </td>
                    <td className="py-2.5 pr-4">
                      {products.find((p) => p.slug === l.product_slug)?.name ?? l.product_slug}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {new Date(l.created_at).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-2.5">
                      {l.converted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="size-3.5" /> bought
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <MessageCircle className="size-3.5" /> follow up
                        </span>
                      )}
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
