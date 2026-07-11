"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { setConfig } from "@/lib/app-config";
import { supabaseAdmin } from "@/lib/supabase";

function refresh() {
  revalidatePath("/admin/affiliates");
  revalidatePath("/admin");
}

/**
 * Marks a withdrawal as paid AFTER you've sent the money manually
 * (Paystack Transfers or your bank app). This only updates the record —
 * no money moves automatically, so there's nothing to hack.
 */
export async function markWithdrawalPaid(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const supabase = supabaseAdmin();
  if (!id || !supabase) return;

  await supabase
    .from("withdrawals")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  refresh();
}

/** Rejects a request — the amount returns to the affiliate's balance. */
export async function rejectWithdrawal(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const supabase = supabaseAdmin();
  if (!id || !supabase) return;

  await supabase
    .from("withdrawals")
    .update({ status: "rejected" })
    .eq("id", id)
    .eq("status", "pending");
  refresh();
}

export type AffiliateConfigState = { ok?: boolean; error?: string } | null;

export async function saveAffiliateConfig(
  _prev: AffiliateConfigState,
  formData: FormData
): Promise<AffiliateConfigState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const percent = Number(formData.get("commission_percent"));
  const minWithdrawal = Number(formData.get("min_withdrawal_naira"));
  if (!Number.isFinite(percent) || percent < 0 || percent > 90) {
    return { error: "Commission must be between 0 and 90 percent." };
  }
  if (!Number.isFinite(minWithdrawal) || minWithdrawal < 100) {
    return { error: "Minimum withdrawal must be at least ₦100." };
  }

  const ok =
    (await setConfig("commission_percent", String(Math.round(percent)))) &&
    (await setConfig("min_withdrawal_naira", String(Math.round(minWithdrawal))));
  if (!ok) return { error: "Couldn't save — is Supabase connected?" };

  refresh();
  return { ok: true };
}
