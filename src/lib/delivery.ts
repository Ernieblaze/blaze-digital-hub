/**
 * Automatic product delivery email — SERVER ONLY.
 *
 * Sends the buyer their download link right after a successful payment
 * (triggered by the Paystack webhook). Requires:
 * - RESEND_API_KEY in env (free at resend.com — 100 emails/day, plenty to start)
 * - the product's downloadUrl set in the admin product form
 *
 * Optional: RESEND_FROM to send from your own domain once verified in Resend,
 * e.g. "Blaze Digital Hub <hello@yourdomain.com>". Defaults to Resend's
 * shared onboarding sender so it works before any domain setup.
 */

import { Resend } from "resend";
import type { Product } from "@/lib/products";
import { formatNaira } from "@/lib/products";

export function isDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendDeliveryEmail(
  customerEmail: string,
  product: Product
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !product.downloadUrl) return false;

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "Blaze Digital Hub <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: customerEmail,
    subject: `🔥 Your download: ${product.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#ea580c">Payment received — here's your product! 🔥</h2>
        <p>Thank you for buying <strong>${product.name}</strong> (${formatNaira(product.price)}) from Blaze Digital Hub.</p>
        <p style="margin:28px 0">
          <a href="${product.downloadUrl}"
             style="background:#ea580c;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
            Download ${product.name}
          </a>
        </p>
        <p style="font-size:13px;color:#666">
          Save this email — the link is yours for life, and you'll get free updates whenever
          this product improves. Questions? Just reply to this email.
        </p>
        <p style="font-size:13px;color:#666">— Coach Ernest Favour (Ernie Blaze)</p>
      </div>
    `,
  });

  if (error) {
    console.error("[delivery] email failed:", error.message);
    return false;
  }
  return true;
}
