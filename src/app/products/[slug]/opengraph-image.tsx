import { ImageResponse } from "next/og";
import { getProduct, products } from "@/lib/products";

export const alt = "Product — Blaze Digital Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

// The ₦ glyph isn't available to the OG renderer's font, so prices use "NGN".
const ngn = (amount: number) => `NGN ${amount.toLocaleString("en-NG")}`;

export default async function ProductOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #7c2d12 0%, #0a0a0a 55%, #0a0a0a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>
          {`🔥 Blaze Digital Hub${product ? ` · ${product.category}` : ""}`}
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, marginTop: 20, lineHeight: 1.1 }}>
          {product?.name ?? "Premium Digital Products"}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#d4d4d4", marginTop: 24, lineHeight: 1.4 }}>
          {product?.tagline ?? "Trading, education, design and hustle tools."}
        </div>
        {product ? (
          <div style={{ display: "flex", alignItems: "center", marginTop: 36 }}>
            <span style={{ color: "#f97316", fontSize: 40, fontWeight: 800 }}>{ngn(product.price)}</span>
            {product.compareAtPrice ? (
              <span style={{ color: "#737373", textDecoration: "line-through", marginLeft: 20, fontSize: 30 }}>
                {ngn(product.compareAtPrice)}
              </span>
            ) : null}
            <span style={{ fontSize: 24, color: "#a3a3a3", marginLeft: 24 }}>Instant delivery ⚡</span>
          </div>
        ) : null}
      </div>
    ),
    size
  );
}
