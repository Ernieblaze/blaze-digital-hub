import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Subscribers",
  robots: { index: false, follow: false },
};

export default async function AdminSubscribersPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const supabase = supabaseAdmin();
  let subscribers: { email: string; source: string; created_at: string }[] = [];
  let total = 0;
  if (supabase) {
    const { data, count } = await supabase
      .from("newsletter_subscribers")
      .select("email, source, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(1000);
    subscribers = data ?? [];
    total = count ?? 0;
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Newsletter subscribers</CardTitle>
              <CardDescription>{total} total — your email list, ready for campaigns.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/subscribers/export">
                <Download className="size-4" /> Export CSV
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {subscribers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No subscribers yet — signups from the site footer land here.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Source</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.email} className="border-b last:border-0">
                    <td className="py-2.5 pr-4">{s.email}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{s.source}</td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
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
