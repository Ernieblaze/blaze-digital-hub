"use server";

import { addBrevoContact } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase";

export type SubscribeState = { ok: boolean; error?: string } | null;

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const supabase = supabaseAdmin();
  if (!supabase) {
    // Supabase not connected yet — accept the signup so the visitor's
    // experience isn't broken, but flag it in the server logs.
    console.warn(`[newsletter] Supabase not configured — signup NOT stored: ${email}`);
    return { ok: true };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("[newsletter] insert failed:", error.message);
    return { ok: false, error: "Something went wrong — try again in a moment." };
  }

  // Best-effort: also sync into Brevo contacts for campaigns.
  await addBrevoContact(email);

  return { ok: true };
}
