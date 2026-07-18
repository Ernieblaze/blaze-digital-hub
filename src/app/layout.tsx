import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { SupportButton } from "@/components/site/support-button";
import { siteSettings } from "@/lib/site-settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blaze-digital-hub.vercel.app"), // TODO: swap for your custom domain
  title: {
    default: "Blaze Digital Hub — Premium Digital Products by Ernie Blaze",
    template: "%s | Blaze Digital Hub",
  },
  description:
    "Trading guides, exam success packs, design templates and hustle tools built for Nigerian students, traders and creators. Instant delivery, secure Paystack checkout.",
  keywords: [
    "digital products Nigeria",
    "forex trading guide",
    "JAMB study pack",
    "Canva templates",
    "student hustle",
    "Ernie Blaze",
  ],
  openGraph: {
    title: "Blaze Digital Hub",
    description:
      "Premium digital products for Nigerian hustlers — trading, education, design and productivity.",
    type: "website",
    locale: "en_NG",
    siteName: "Blaze Digital Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blaze Digital Hub",
    description:
      "Premium digital products for Nigerian hustlers — trading, education, design and productivity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Blaze Digital Hub",
              url: "https://blaze-digital-hub.vercel.app",
            }),
          }}
        />
        {/* Dark by default for the premium feel; users can toggle from the navbar */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <SupportButton email={siteSettings.contactEmail} />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
