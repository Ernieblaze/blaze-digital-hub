"use server";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getProducts, productToRow } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase";
import { getCategories } from "@/lib/app-config";
import { uploadProductImage } from "@/lib/storage";
import {
  coverPresets,
  productIcons,
  products as fileProducts,
  type Category,
  type Product,
} from "@/lib/products";

const DATA_FILE = path.join(process.cwd(), "src", "lib", "products-data.json");

export type ProductFormState = { error: string } | null;

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

/* ── JSON-file fallback (used when Supabase isn't configured, e.g. local dev) ── */

async function loadFileProducts(): Promise<Product[]> {
  return JSON.parse(await readFile(DATA_FILE, "utf8")) as Product[];
}

async function saveFileProducts(list: Product[]) {
  try {
    await writeFile(DATA_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  } catch {
    throw new Error(
      "Couldn't save. Supabase isn't connected and the live file system is read-only — connect Supabase (see /admin) to manage products from anywhere."
    );
  }
}

/* ── Create / update ─────────────────────────────────────────────────────── */

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
  if (!(await getCategories()).includes(category)) return { error: "Pick a valid category." };
  if (!productIcons.includes(icon)) return { error: "Pick a valid cover icon." };

  const whatsInside = str("whatsInside")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (whatsInside.length === 0) return { error: "Add at least one “what's inside” item." };

  const originalSlug = str("originalSlug");
  const slug = str("slug") ? slugify(str("slug")) : slugify(name);

  // Cover image: a direct file upload wins over a pasted URL.
  let imageUrl =
    str("image").startsWith("/") || str("image").startsWith("http") ? str("image") : "";
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadProductImage(imageFile, slug);
    if (uploaded.error) return { error: uploaded.error };
    imageUrl = uploaded.url!;
  }

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
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(badge === "Bestseller" || badge === "New" || badge === "Hot Deal" ? { badge } : {}),
    ...(formData.get("featured") ? { featured: true } : {}),
    paystackUrl: str("paystackUrl") || `https://paystack.shop/pay/REPLACE-${slug}`,
    ...(str("downloadUrl").startsWith("http") ? { downloadUrl: str("downloadUrl") } : {}),
    testimonial: {
      quote: str("testimonialQuote") || "Loved it — instant delivery and pure value.",
      author: str("testimonialAuthor") || "Happy Customer",
      role: str("testimonialRole") || "Verified Buyer",
    },
  };

  // Duplicate-slug guard against the current catalog (whichever source is live)
  const existing = await getProducts();
  const slugTaken = existing.some((p) => p.slug === slug);
  const isRename = originalSlug && originalSlug !== slug;
  if (slugTaken && (!originalSlug || isRename)) {
    return { error: `A product with the slug “${slug}” already exists.` };
  }

  const supabase = supabaseAdmin();
  if (supabase) {
    // If the table is still empty, seed it first so one edit doesn't strand
    // the rest of the catalog in the JSON file.
    const { count } = await supabase.from("products").select("slug", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      await supabase.from("products").upsert(fileProducts.map(productToRow), { onConflict: "slug" });
    }
    if (isRename) {
      const { error } = await supabase.from("products").delete().eq("slug", originalSlug);
      if (error) return { error: `Rename failed: ${error.message}` };
    }
    const { error } = await supabase
      .from("products")
      .upsert(productToRow(product), { onConflict: "slug" });
    if (error) return { error: `Save failed: ${error.message}` };
  } else {
    const list = await loadFileProducts();
    const index = originalSlug ? list.findIndex((p) => p.slug === originalSlug) : -1;
    if (index === -1) list.push(product);
    else list[index] = product;
    try {
      await saveFileProducts(list);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to save." };
    }
  }

  revalidateShop(slug);
  if (isRename) revalidatePath(`/products/${originalSlug}`);
  redirect("/admin");
}

/* ── Delete ──────────────────────────────────────────────────────────────── */

export async function deleteProduct(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  const supabase = supabaseAdmin();
  if (supabase) {
    // Seed first if empty (same reasoning as saveProduct), then delete.
    const { count } = await supabase.from("products").select("slug", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      await supabase.from("products").upsert(fileProducts.map(productToRow), { onConflict: "slug" });
    }
    await supabase.from("products").delete().eq("slug", slug);
  } else {
    const list = await loadFileProducts();
    const next = list.filter((p) => p.slug !== slug);
    if (next.length === list.length) return;
    await saveFileProducts(next);
  }

  revalidateShop(slug);
}

/* ── One-click import: copy the JSON catalog into Supabase ──────────────── */

export async function importCatalogToSupabase() {
  if (!(await isAdmin())) redirect("/admin/login");

  const supabase = supabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase
    .from("products")
    .upsert(fileProducts.map(productToRow), { onConflict: "slug" });
  if (error) console.error("[catalog] import failed:", error.message);

  revalidatePath("/");
  revalidatePath("/admin");
}
