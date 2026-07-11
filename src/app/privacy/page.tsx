import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { siteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Blaze Digital Hub handles your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 11, 2026"
      intro="We collect as little of your data as possible and we never sell it. Here's exactly what happens with your information when you use Blaze Digital Hub."
      sections={[
        {
          heading: "1. What we collect",
          body: [
            "When you buy a product, Paystack collects your name, email address and payment details to process the transaction and deliver your download. We receive your name, email and purchase record — never your card details.",
            "When you browse the site, we use privacy-friendly analytics (Vercel Analytics) to count page views and understand which products people look at. This does not use cookies and does not identify you personally.",
          ],
        },
        {
          heading: "2. How we use it",
          body: [
            "To deliver your purchases and product updates, respond to support requests, and understand which products help people the most. If you join our email list, we'll send product updates and useful content — you can unsubscribe anytime with one click.",
          ],
        },
        {
          heading: "3. What we never do",
          body: [
            "We never sell your data. We never share your details with third parties except the services that make the site work: Paystack (payments) and our hosting/analytics provider (Vercel).",
          ],
        },
        {
          heading: "4. Cookies",
          body: [
            "The public site uses no tracking cookies. A single functional cookie is used only in the site owner's private admin area to keep the owner logged in.",
          ],
        },
        {
          heading: "5. Your rights",
          body: [
            "You can ask us at any time what data we hold about you, ask us to correct it, or ask us to delete it. Email us and we'll handle it within 30 days.",
          ],
        },
        {
          heading: "6. Contact",
          body: [
            `For anything privacy-related, email ${siteSettings.contactEmail}.`,
          ],
        },
      ]}
    />
  );
}
