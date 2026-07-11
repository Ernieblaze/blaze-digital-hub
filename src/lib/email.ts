/**
 * Transactional email via Brevo — SERVER ONLY.
 *
 * Setup:
 * 1. Brevo dashboard → SMTP & API → API Keys → Generate a new API key.
 * 2. Set BREVO_API_KEY in .env.local and on Vercel.
 * 3. Make sure the sender email is a verified sender in Brevo
 *    (Senders & IPs → Senders). Override with BREVO_FROM_EMAIL /
 *    BREVO_FROM_NAME if you want a different one.
 *
 * Free tier: 300 emails/day — plenty for delivery + login codes.
 */

import { siteSettings } from "@/lib/site-settings";

export function isEmailConfigured() {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_FROM_NAME || "Blaze Digital Hub",
        email: process.env.BREVO_FROM_EMAIL || siteSettings.contactEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error("[email] Brevo send failed:", res.status, await res.text());
    return false;
  }
  return true;
}

/**
 * Adds/updates an email in your Brevo contacts, so newsletter signups are
 * campaign-ready inside Brevo without CSV exports. Optionally add them to a
 * specific list by setting BREVO_LIST_ID (the list's number in Brevo).
 */
export async function addBrevoContact(email: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const listId = Number(process.env.BREVO_LIST_ID);
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      updateEnabled: true,
      ...(Number.isFinite(listId) && listId > 0 ? { listIds: [listId] } : {}),
    }),
  });

  if (!res.ok && res.status !== 204) {
    console.error("[email] Brevo contact sync failed:", res.status, await res.text());
    return false;
  }
  return true;
}
