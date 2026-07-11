import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { productCategories, products } from "@/lib/products";
import { siteSettings } from "@/lib/site-settings";
import { CategoryManager, SiteSettingsForm } from "./settings-forms";

export const metadata: Metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const inUse = [...new Set(products.map((p) => p.category))];

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
          <CardTitle className="text-xl">Site settings</CardTitle>
          <CardDescription>
            Hero copy, WhatsApp number, email and social links — changes apply to the whole
            site instantly. Push to GitHub to update the live site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SiteSettingsForm settings={siteSettings} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Categories</CardTitle>
          <CardDescription>
            Shop filter categories. A category with products can&apos;t be deleted — move or
            delete its products first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManager categories={productCategories} inUse={inUse} />
        </CardContent>
      </Card>
    </main>
  );
}
