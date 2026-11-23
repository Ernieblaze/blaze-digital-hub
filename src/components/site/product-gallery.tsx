import Image from "next/image";
import type { Product } from "@/lib/products";

/** Reads "name-1600x1000.webp" style sizes; falls back to a 4:3 box. */
function sizeOf(src: string) {
  const m = src.match(/-(\d{3,5})x(\d{3,5})\.(?:webp|png|jpe?g|avif)(?:\?|$)/i);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : { width: 1200, height: 900 };
}

/** "Look inside" images for a product: real pages, previews and photos. */
export function ProductGallery({ product }: { product: Pick<Product, "name" | "gallery"> }) {
  const images = product.gallery ?? [];
  if (images.length === 0) return null;
  return (
    <section className="mt-16" aria-labelledby="look-inside">
      <h2 id="look-inside" className="text-2xl font-bold tracking-tight">
        Look inside {product.name}
      </h2>
      <p className="mt-2 text-muted-foreground">Real pages and examples from the guide.</p>
      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {images.map((img) => {
          const { width, height } = sizeOf(img.src);
          return (
            <figure key={img.src} className="group break-inside-avoid overflow-hidden rounded-xl border bg-card">
              <Image
                src={img.src}
                alt={img.alt}
                width={width}
                height={height}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </figure>
          );
        })}
      </div>
    </section>
  );
}
