import Image from "next/image";
import {
  CandlestickChart,
  Coins,
  GraduationCap,
  NotebookPen,
  Palette,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

const icons = {
  candlestick: CandlestickChart,
  coins: Coins,
  graduation: GraduationCap,
  palette: Palette,
  rocket: Rocket,
  notebook: NotebookPen,
} as const;

/**
 * Cover art for a product. Uses the real image when `product.image` is set
 * (drop files in public/products/ and set the path in the admin product form);
 * otherwise renders the branded gradient + icon.
 */
export function ProductCover({
  product,
  className,
}: {
  product: Pick<Product, "icon" | "cover" | "name" | "image">;
  className?: string;
}) {
  if (product.image) {
    // Uploaded covers show at their FULL natural ratio (no cropping) —
    // `aspect-auto`/`h-auto` at the end override any aspect classes the
    // parent passes for the gradient fallback.
    return (
      <div className={cn("relative overflow-hidden", className, "aspect-auto h-auto")}>
        <Image
          src={product.image}
          alt={product.name}
          width={1200}
          height={1900}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-auto w-full"
        />
      </div>
    );
  }

  const Icon = icons[product.icon];
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        product.cover,
        className,
      )}
    >
      {/* soft texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute -right-6 -bottom-8 opacity-15">
        <Icon className="size-40 text-white" strokeWidth={1} />
      </div>
      <div className="relative rounded-2xl bg-white/15 p-4 backdrop-blur-sm ring-1 ring-white/25">
        <Icon className="size-9 text-white drop-shadow-sm" strokeWidth={1.75} />
      </div>
    </div>
  );
}
