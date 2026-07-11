/**
 * Admin-editable runtime settings, stored in the Supabase `app_config`
 * table — SERVER ONLY. Unlike site-settings-data.json (read-only on the
 * live server), these can be changed from the admin at any time.
 */

import { supabaseAdmin } from "@/lib/supabase";

export const CONFIG_DEFAULTS = {
  /** Affiliate commission as a percentage of the sale (0–90). */
  commission_percent: "50",
  /** Minimum withdrawal in Naira (~$10). */
  min_withdrawal_naira: "15000",
} as const;

export type ConfigKey = keyof typeof CONFIG_DEFAULTS;

export async function getConfig(key: ConfigKey): Promise<string> {
  const supabase = supabaseAdmin();
  if (!supabase) return CONFIG_DEFAULTS[key];
  const { data } = await supabase.from("app_config").select("value").eq("key", key).single();
  return data?.value ?? CONFIG_DEFAULTS[key];
}

export async function getConfigNumber(key: ConfigKey): Promise<number> {
  const value = Number(await getConfig(key));
  return Number.isFinite(value) ? value : Number(CONFIG_DEFAULTS[key]);
}

export async function setConfig(key: ConfigKey, value: string): Promise<boolean> {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("app_config")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) console.error("[config] save failed:", error.message);
  return !error;
}
