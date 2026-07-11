import { ImageResponse } from "next/og";

export const alt = "Blaze Digital Hub — Premium Digital Products by Ernie Blaze";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c2d12 0%, #0a0a0a 55%, #0a0a0a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, marginBottom: 8 }}>🔥</div>
        <div style={{ fontSize: 72, fontWeight: 800, display: "flex" }}>
          Blaze <span style={{ color: "#f97316", marginLeft: 18 }}>Digital Hub</span>
        </div>
        <div style={{ fontSize: 30, color: "#d4d4d4", marginTop: 18 }}>
          Digital products that turn hustle into income
        </div>
        <div style={{ fontSize: 22, color: "#a3a3a3", marginTop: 28 }}>
          Trading · Education · Design · Hustle Tools
        </div>
      </div>
    ),
    size
  );
}
