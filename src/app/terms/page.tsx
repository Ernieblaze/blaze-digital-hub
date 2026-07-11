import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { siteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Blaze Digital Hub.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 11, 2026"
      intro="These terms govern your use of Blaze Digital Hub and your purchase of our digital products. By buying or downloading anything from this site, you agree to them. They're written in plain language on purpose — no tricks."
      sections={[
        {
          heading: "1. What we sell",
          body: [
            "Blaze Digital Hub sells digital products — e-books, guides, templates, planners and similar downloadable files. Nothing physical is shipped. Products are delivered electronically to the email address you provide at checkout, immediately after successful payment.",
          ],
        },
        {
          heading: "2. Your license",
          body: [
            "Each purchase grants you a personal, non-transferable license to use the product for your own learning or business. You may not resell, redistribute, share, publish or claim authorship of any product or substantial part of it. Group or team licenses are available on request.",
          ],
        },
        {
          heading: "3. Payments",
          body: [
            "All payments are processed by Paystack. We never see or store your card details. Prices are displayed in Nigerian Naira (₦) and may change at any time — the price you pay is the price shown at checkout.",
          ],
        },
        {
          heading: "4. No income guarantees",
          body: [
            "Our trading, hustle and education products teach skills and systems that have worked for real people — but results depend on your effort, discipline and market conditions. Nothing on this site is financial advice, and we do not guarantee profits, exam scores or income. Trading in particular carries real risk of loss; never trade money you cannot afford to lose.",
          ],
        },
        {
          heading: "5. Refunds",
          body: [
            "Because products are delivered instantly, all sales are final once delivered, except in the specific situations covered by our Refund Policy (double charge, non-delivery, or a product materially different from its description).",
          ],
        },
        {
          heading: "6. Updates and availability",
          body: [
            "Where a product page promises lifetime updates, we will deliver new editions of that product to buyers at no extra charge. We may retire, rename or replace products at any time; retired products remain usable by existing buyers.",
          ],
        },
        {
          heading: "7. Acceptable use",
          body: [
            "Don't use this site or its content for anything illegal, and don't attempt to break, scrape or overload it. We may refuse service to anyone abusing these terms.",
          ],
        },
        {
          heading: "8. Contact",
          body: [
            `Questions about these terms? Email ${siteSettings.contactEmail} or reach us on WhatsApp via the chat button on any page.`,
          ],
        },
      ]}
    />
  );
}
