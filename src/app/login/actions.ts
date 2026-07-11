"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import {
  BUYER_COOKIE,
  buyerCookieValue,
  codeExpiry,
  generateCode,
  hashCode,
} from "@/lib/buyer-auth";
import { supabaseAdmin } from "@/lib/supabase";

export type PortalState =
  | { step: "request"; error?: string }
  | { step: "verify"; email: string; error?: string }
  | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestCode(_prev: PortalState, formData: FormData): Promise<PortalState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { step: "request", error: "Enter a valid email address." };

  const supabase = supabaseAdmin();
  if (!supabase || !isEmailConfigured()) {
    return {
      step: "request",
      error:
        "The download portal isn't switched on yet. Message us on WhatsApp and we'll send your files directly.",
    };
  }

  const code = generateCode();
  const { error } = await supabase.from("login_codes").upsert(
    { email, code_hash: hashCode(email, code), expires_at: codeExpiry() },
    { onConflict: "email" }
  );
  if (error) {
    console.error("[portal] code store failed:", error.message);
    return { step: "request", error: "Something went wrong — try again in a moment." };
  }

  const sent = await sendEmail({
    to: email,
    subject: `${code} is your Blaze Digital Hub login code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#ea580c">Your login code 🔥</h2>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${code}</p>
        <p style="font-size:13px;color:#666">Enter this on the download page. It expires in 15 minutes. If you didn't request it, ignore this email.</p>
      </div>
    `,
  });
  if (!sent) {
    return { step: "request", error: "Couldn't send the email — try again in a moment." };
  }

  return { step: "verify", email };
}

export async function verifyCode(_prev: PortalState, formData: FormData): Promise<PortalState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { step: "request", error: "Start again with your email." };
  if (!/^\d{6}$/.test(code)) return { step: "verify", email, error: "The code is 6 digits." };

  const supabase = supabaseAdmin();
  if (!supabase) return { step: "request", error: "Portal not available right now." };

  const { data } = await supabase
    .from("login_codes")
    .select("code_hash, expires_at")
    .eq("email", email)
    .single();

  if (!data || data.code_hash !== hashCode(email, code)) {
    return { step: "verify", email, error: "Wrong code. Check the email and try again." };
  }
  if (new Date(data.expires_at) < new Date()) {
    return { step: "request", error: "That code expired — request a new one." };
  }

  await supabase.from("login_codes").delete().eq("email", email);

  const cookieStore = await cookies();
  cookieStore.set(BUYER_COOKIE, buyerCookieValue(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath("/login");
  return null; // page re-renders as logged in
}

export async function buyerLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(BUYER_COOKIE);
  revalidatePath("/login");
}
