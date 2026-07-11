import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "Add Product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Add a new product</CardTitle>
          <CardDescription>
            Saves to <code className="rounded bg-muted px-1">src/lib/products-data.json</code> —
            the shop, featured section and product page appear instantly. Push to GitHub to
            update the live site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </main>
  );
}
