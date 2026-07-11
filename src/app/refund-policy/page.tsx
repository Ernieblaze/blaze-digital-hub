import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { siteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund Policy for Blaze Digital Hub digital products.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="July 11, 2026"
      intro="Digital products are delivered instantly and can't be 'returned', so all sales are final once delivered — with three honest exceptions where we'll always make it right."
      sections={[
        {
          heading: "When you WILL get a refund (or the product, or both)",
          body: [
            "1. Double charge — if Paystack charged you twice for the same product, we refund the duplicate within 5 business days of confirming it.",
            "2. Non-delivery — if your payment succeeded but the product never arrived (after checking spam and confirming your email address), we'll resend it immediately; if we somehow can't deliver it within 48 hours, you get a full refund.",
            "3. Wrong description — if the product you received is materially different from what its product page described, tell us within 7 days of purchase and we'll refund you in full.",
          ],
        },
        {
          heading: "When we can't refund",
          body: [
            "\"I changed my mind\", \"I already knew this\", or \"I didn't get results\" — because the full product is in your hands the moment it's delivered, these can't be refunded. Please read the product page (it lists exactly what's inside) before buying.",
          ],
        },
        {
          heading: "How to request a refund",
          body: [
            `Message us on WhatsApp (chat button on any page) or email ${siteSettings.contactEmail} with: the email you used at checkout, your Paystack payment reference, and a short description of the issue. We respond within 24 hours.`,
          ],
        },
      ]}
    />
  );
}
