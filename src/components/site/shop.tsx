"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/motion";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "name", label: "Name A–Z" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

function sortProducts(list: Product[], sort: SortValue) {
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
  }
}

export function Shop({ products }: { products: Product[] }) {
  const [active, setActive] = useState<string>("All");
  // Pills derive from the live catalog, so new categories appear the moment
  // a product uses them — no separate list to keep in sync.
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("featured");

  const q = query.trim().toLowerCase();
  const visible = sortProducts(
    products.filter(
      (p) =>
        (active === "All" || p.category === active) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)),
    ),
    sort,
  );

  return (
    <section id="shop" className="bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Shop"
          title="Every tool in the arsenal"
          description="Filter by what you need — trading skills, exam success, brand design or extra income."
        />

        {/* Category filter pills */}
        <div
          role="tablist"
          aria-label="Filter products by category"
          className="mb-10 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((category) => (
            <button
              key={category}
              role="tab"
              aria-selected={active === category}
              onClick={() => setActive(category)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                active === category
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {active === category ? (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-primary shadow-md shadow-orange-500/25"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <span className="relative">{category}</span>
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full rounded-full border border-input bg-background py-2.5 pr-4 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            aria-label="Sort products"
            className="w-full max-w-sm rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Product grid — animates as the filter changes */}
        <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((product) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            No products match “{query}”. Try a different search or category.
          </p>
        )}
      </div>
    </section>
  );
}
