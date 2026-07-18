import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { getAllConfig, getCategories } from "@/lib/app-config";
import { getProducts } from "@/lib/catalog";
import { siteSettings } from "@/lib/site-settings";
import {
  CategoryManager,
  ClearOrderHistoryButton,
  HomeContentForm,
  SiteSettingsForm,
} from "./settings-forms";

export const metadata: Metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [products, content, productCategories] = await Promise.all([
    getProducts(),
    getAllConfig(),
    getCategories(),
  ]);
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
          <CardTitle className="text-xl">Homepage content</CardTitle>
          <CardDescription>
            Hero text and announcement bar — stored in the database, so edits made right here
            on the live site apply within a minute. No deploy needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomeContentForm content={content} />
        </CardContent>
      </Card>

      <Card className="mt-6">
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

      <Card className="mt-6 border-red-500/40">
        <CardHeader>
          <CardTitle className="text-xl">Danger zone</CardTitle>
          <CardDescription>
            Wipes every recorded order (test purchases included) so revenue charts and
            sales-by-product start from zero. Note: cleared buyers also lose the purchase
            list in their buyer portal (emailed files still work). Export the CSV from
            Orders first if you want a copy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClearOrderHistoryButton />
        </CardContent>
      </Card>
    </main>
  );
}
