"use server";

import { isEmailConfigured, sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { siteSettings } from "@/lib/site-settings";

export type ContactState = { ok?: boolean; error?: string } | null;

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message) return { error: "Fill in your name and message." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (message.length > 4000) return { error: "Message is too long." };
  if (!rateLimit(`contact:${email}`, 3)) {
    return { error: "Too many messages — give us a moment to reply first!" };
  }

  if (!isEmailConfigured()) {
    return {
      error: `The contact form isn't switched on yet — email us directly at ${siteSettings.contactEmail}.`,
    };
  }

  const sent = await sendEmail({
    to: siteSettings.contactEmail,
    subject: `📩 Contact form: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h3>New message from the website</h3>
        <p><strong>Name:</strong> ${name.replace(/</g, "&lt;")}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p style="white-space:pre-wrap;border-left:3px solid #ea580c;padding-left:12px">${message.replace(/</g, "&lt;")}</p>
      </div>
    `,
  });

  return sent ? { ok: true } : { error: "Couldn't send right now — try WhatsApp instead." };
}
