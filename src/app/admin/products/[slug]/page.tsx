import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin-auth";
import { getCategories } from "@/lib/app-config";
import { getProductBySlug } from "@/lib/catalog";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { slug } = await params;
  const [product, productCategories] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit “{product.name}”</CardTitle>
          <CardDescription>
            Changes go live on the site immediately (locally). Push to GitHub to update the
            deployed site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} productCategories={productCategories} />
        </CardContent>
      </Card>
    </main>
  );
}
