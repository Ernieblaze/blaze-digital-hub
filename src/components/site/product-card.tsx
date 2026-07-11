"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductCover } from "@/components/site/product-cover";
import { fadeUp } from "@/components/site/motion";
import { formatNaira, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="h-full">
      <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow duration-300 hover:shadow-xl hover:shadow-orange-500/10">
        {/* Cover — the whole card links to the product page */}
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="relative block">
          <ProductCover
            product={product}
            className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {product.badge ? (
            <Badge className="absolute top-3 left-3 border-0 bg-black/55 font-semibold text-white backdrop-blur-sm">
              <Zap className="size-3 fill-current text-amber-400" />
              {product.badge}
            </Badge>
          ) : null}
        </Link>

        <CardContent className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">
              {product.category}
            </span>
          </div>
          <Link href={`/products/${product.slug}`} className="outline-none">
            <h3 className="font-semibold text-balance transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.tagline}</p>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3 p-5 pt-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formatNaira(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatNaira(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
          {/* Internal checkout: tracks the product + any referral code via
              Paystack metadata, then redirects to Paystack's secure page. */}
          <Button asChild size="sm" className="font-semibold">
            <Link href={`/checkout/${product.slug}`}>
              Buy Now
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
