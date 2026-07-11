"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

export type CouponFormState = { ok?: boolean; error?: string } | null;

export async function createCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  const percentOff = Number(formData.get("percent_off"));
  const maxUses = String(formData.get("max_uses") ?? "").trim();
  const expiresAt = String(formData.get("expires_at") ?? "").trim();

  if (code.length < 3) return { error: "Code must be at least 3 letters/numbers." };
  if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 90) {
    return { error: "Discount must be 1–90 percent." };
  }

  const supabase = supabaseAdmin();
  if (!supabase) return { error: "Supabase not connected." };

  const { error } = await supabase.from("coupons").insert({
    code,
    percent_off: percentOff,
    max_uses: maxUses ? Number(maxUses) : null,
    expires_at: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
  });
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? `“${code}” already exists.`
        : "Couldn't create the coupon.",
    };
  }

  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCoupon(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const code = String(formData.get("code") ?? "");
  const active = formData.get("active") === "1";
  const supabase = supabaseAdmin();
  if (!code || !supabase) return;

  await supabase.from("coupons").update({ active: !active }).eq("code", code);
  revalidatePath("/admin/coupons");
}
