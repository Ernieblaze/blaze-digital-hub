"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { coverPresets, productIcons, type Product } from "@/lib/products";
import { saveProduct, type ProductFormState } from "./actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "mb-1 block text-sm font-medium";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  );
}

export function ProductForm({
  product,
  productCategories,
}: {
  product?: Product;
  productCategories: string[];
}) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, null);

  return (
    <form action={action} className="space-y-4">
      {product && <input type="hidden" name="originalSlug" value={product.slug} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name *">
          <input name="name" required defaultValue={product?.name} className={inputClass} />
        </Field>
        <Field label="Slug (leave blank to auto-generate)">
          <input name="slug" defaultValue={product?.slug} className={inputClass} placeholder="my-product" />
        </Field>
        <Field label="Category *">
          <select name="category" defaultValue={product?.category ?? productCategories[0]} className={inputClass}>
            {productCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Badge">
          <select name="badge" defaultValue={product?.badge ?? ""} className={inputClass}>
            <option value="">None</option>
            <option>Bestseller</option>
            <option>New</option>
            <option>Hot Deal</option>
          </select>
        </Field>
        <Field label="Price (₦) *">
          <input name="price" type="number" min="1" required defaultValue={product?.price} className={inputClass} />
        </Field>
        <Field label="Compare-at price (₦, optional strikethrough)">
          <input name="compareAtPrice" type="number" min="0" defaultValue={product?.compareAtPrice} className={inputClass} />
        </Field>
        <Field label="Cover icon">
          <select name="icon" defaultValue={product?.icon ?? "rocket"} className={inputClass}>
            {productIcons.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>
        <Field label="Cover gradient">
          <select name="cover" defaultValue={product?.cover ?? coverPresets[0]} className={inputClass}>
            {coverPresets.map((c, idx) => (
              <option key={c} value={c}>Blaze gradient {idx + 1}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tagline (short hook shown on the card) *">
        <input name="tagline" required defaultValue={product?.tagline} className={inputClass} />
      </Field>

      <Field label="Description *">
        <textarea name="description" required rows={4} defaultValue={product?.description} className={inputClass} />
      </Field>

      <Field label="What's inside — one item per line *">
        <textarea
          name="whatsInside"
          required
          rows={5}
          defaultValue={product?.whatsInside.join("\n")}
          className={inputClass}
          placeholder={"120-page PDF course\n10 video breakdowns\nLifetime updates"}
        />
      </Field>

      <Field label="Real cover image (optional — drop the file in public/products/ first, e.g. /products/my-product.jpg)">
        <input
          name="image"
          defaultValue={product?.image}
          className={inputClass}
          placeholder="/products/my-product.jpg"
        />
      </Field>

      <Field label="Paystack payment link (leave blank for a placeholder)">
        <input
          name="paystackUrl"
          type="url"
          defaultValue={product?.paystackUrl.includes("REPLACE") ? "" : product?.paystackUrl}
          className={inputClass}
          placeholder="https://paystack.shop/pay/your-page"
        />
      </Field>

      <Field label="Download link for buyers (Google Drive / Dropbox — used by the automatic delivery email)">
        <input
          name="downloadUrl"
          type="url"
          defaultValue={product?.downloadUrl}
          className={inputClass}
          placeholder="https://drive.google.com/…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <span className={labelClass}>Testimonial</span>
          <textarea name="testimonialQuote" rows={2} defaultValue={product?.testimonial.quote} className={inputClass} placeholder="Quote" />
        </div>
        <input name="testimonialAuthor" defaultValue={product?.testimonial.author} className={inputClass} placeholder="Author (e.g. Tobi A.)" />
        <input name="testimonialRole" defaultValue={product?.testimonial.role} className={`${inputClass} sm:col-span-2`} placeholder="Role (e.g. Funded Trader, Lagos)" />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} className="size-4 accent-orange-600" />
        Featured — show in the “Featured products” section on the homepage
      </label>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={pending} className="font-semibold">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {product ? "Save changes" : "Add product"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
