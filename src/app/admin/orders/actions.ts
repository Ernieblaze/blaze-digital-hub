"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getProductBySlug } from "@/lib/catalog";
import { sendDeliveryEmail } from "@/lib/delivery";
import { supabaseAdmin } from "@/lib/supabase";

function refreshOrders() {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

/** Re-sends the download email for an order (e.g. buyer lost it). */
export async function resendDelivery(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const reference = String(formData.get("reference") ?? "");
  const supabase = supabaseAdmin();
  if (!reference || !supabase) return;

  const { data: order } = await supabase
    .from("orders")
    .select("customer_email, product_slug")
    .eq("paystack_reference", reference)
    .single();
  if (!order?.product_slug || !order.customer_email) return;

  const product = await getProductBySlug(order.product_slug);
  if (!product) return;

  const delivered = await sendDeliveryEmail(order.customer_email, product);
  if (delivered) {
    await supabase
      .from("orders")
      .update({ delivered_at: new Date().toISOString() })
      .eq("paystack_reference", reference);
  }
  refreshOrders();
}

/** Manually toggles the delivered flag (for files sent by hand/WhatsApp). */
export async function toggleDelivered(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const reference = String(formData.get("reference") ?? "");
  const currentlyDelivered = formData.get("delivered") === "1";
  const supabase = supabaseAdmin();
  if (!reference || !supabase) return;

  await supabase
    .from("orders")
    .update({ delivered_at: currentlyDelivered ? null : new Date().toISOString() })
    .eq("paystack_reference", reference);
  refreshOrders();
}
