"use server";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import {
  coverPresets,
  productCategories,
  productIcons,
  type Category,
  type Product,
} from "@/lib/products";

const DATA_FILE = path.join(process.cwd(), "src", "lib", "products-data.json");

export type ProductFormState = { error: string } | null;

async function loadProducts(): Promise<Product[]> {
  return JSON.parse(await readFile(DATA_FILE, "utf8")) as Product[];
}

async function saveProducts(list: Product[]) {
  try {
    await writeFile(DATA_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  } catch {
    throw new Error(
      "Couldn't write products-data.json. On the live site the file system is read-only — make product changes locally, then push to deploy them."
    );
  }
}

function revalidateShop(slug: string) {
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Adds a new product or updates the one matching `originalSlug`. */
export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const str = (name: string) => String(formData.get(name) ?? "").trim();

  const name = str("name");
  const price = Number(str("price"));
  const category = str("category") as Category;
  const icon = str("icon") as Product["icon"];
  const badge = str("badge");
  const compareAtPrice = str("compareAtPrice");

  if (!name) return { error: "Product name is required." };
  if (!Number.isFinite(price) || price <= 0) return { error: "Price must be a positive number." };
  if (!productCategories.includes(category)) return { error: "Pick a valid category." };
  if (!productIcons.includes(icon)) return { error: "Pick a valid cover icon." };

  const whatsInside = str("whatsInside")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (whatsInside.length === 0) return { error: "Add at least one “what's inside” item." };

  const originalSlug = str("originalSlug");
  const slug = str("slug") ? slugify(str("slug")) : slugify(name);

  const product: Product = {
    slug,
    name,
    category,
    price,
    ...(compareAtPrice && Number(compareAtPrice) > price
      ? { compareAtPrice: Number(compareAtPrice) }
      : {}),
    tagline: str("tagline") || name,
    description: str("description") || str("tagline") || name,
    whatsInside,
    icon,
    cover: coverPresets.includes(str("cover") as (typeof coverPresets)[number])
      ? str("cover")
      : coverPresets[0],
    ...(str("image").startsWith("/") ? { image: str("image") } : {}),
    ...(badge === "Bestseller" || badge === "New" || badge === "Hot Deal" ? { badge } : {}),
    ...(formData.get("featured") ? { featured: true } : {}),
    paystackUrl: str("paystackUrl") || `https://paystack.shop/pay/REPLACE-${slug}`,
    testimonial: {
      quote: str("testimonialQuote") || "Loved it — instant delivery and pure value.",
      author: str("testimonialAuthor") || "Happy Customer",
      role: str("testimonialRole") || "Verified Buyer",
    },
  };

  const list = await loadProducts();
  const existingIndex = originalSlug ? list.findIndex((p) => p.slug === originalSlug) : -1;

  if (existingIndex === -1 && list.some((p) => p.slug === slug)) {
    return { error: `A product with the slug “${slug}” already exists.` };
  }
  if (existingIndex !== -1 && slug !== originalSlug && list.some((p) => p.slug === slug)) {
    return { error: `A product with the slug “${slug}” already exists.` };
  }

  if (existingIndex === -1) list.push(product);
  else list[existingIndex] = product;

  try {
    await saveProducts(list);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save." };
  }

  revalidateShop(slug);
  if (originalSlug && originalSlug !== slug) revalidatePath(`/products/${originalSlug}`);
  redirect("/admin");
}

export async function deleteProduct(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "");
  const list = await loadProducts();
  const next = list.filter((p) => p.slug !== slug);
  if (next.length === list.length) return;

  await saveProducts(next);
  revalidateShop(slug);
}
