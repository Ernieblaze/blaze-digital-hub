/**
 * Automatic product delivery email — SERVER ONLY.
 *
 * Sends the buyer their download link right after a successful payment
 * (triggered by the Paystack webhook). Requires:
 * - BREVO_API_KEY in env (see src/lib/email.ts)
 * - the product's downloadUrl set in the admin product form
 */

import { sendEmail, isEmailConfigured } from "@/lib/email";
import type { Product } from "@/lib/products";
import { formatNaira } from "@/lib/products";

export function isDeliveryConfigured() {
  return isEmailConfigured();
}

/**
 * Sent when a product has no download link yet — the buyer still hears from
 * us immediately instead of silence.
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  product: Product
): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  return sendEmail({
    to: customerEmail,
    subject: `Order confirmed: ${product.name} 🔥`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#ea580c">Your order is confirmed! 🔥</h2>
        <p>We received your payment for <strong>${product.name}</strong> (${formatNaira(product.price)}). Your download is being prepared and will reach this email shortly.</p>
        <p style="font-size:13px;color:#666">
          Need it faster? Just reply to this email with your payment reference and we'll send it right away.
        </p>
        <p style="font-size:13px;color:#666">— Coach Ernest Favour (Ernie Blaze)</p>
      </div>
    `,
  });
}

export async function sendDeliveryEmail(
  customerEmail: string,
  product: Product
): Promise<boolean> {
  if (!isEmailConfigured() || !product.downloadUrl) return false;

  return sendEmail({
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
          this product improves. You can also re-download anytime at
          <a href="https://blaze-digital-hub.vercel.app/login" style="color:#ea580c">blaze-digital-hub.vercel.app/login</a>.
        </p>
        <p style="font-size:13px;color:#666">
          Questions? Just reply to this email — a real person answers.
        </p>
        <p style="font-size:13px;color:#666">— Coach Ernest Favour (Ernie Blaze)</p>
      </div>
    `,
  });
}
