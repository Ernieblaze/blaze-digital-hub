import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { getCategories } from "@/lib/app-config";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "Add Product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const productCategories = await getCategories();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Add a new product</CardTitle>
          <CardDescription>
            Saves straight to your database — the shop, featured section and product page go
            live within a minute, from any device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm productCategories={productCategories} />
        </CardContent>
      </Card>
    </main>
  );
}
