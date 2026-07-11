/**
 * Admin-editable runtime settings, stored in the Supabase `app_config`
 * table — SERVER ONLY. Unlike site-settings-data.json (read-only on the
 * live server), these can be changed from the admin at any time.
 */

import { siteSettings } from "@/lib/site-settings";
import { supabaseAdmin } from "@/lib/supabase";

export const CONFIG_DEFAULTS = {
  /** Affiliate commission as a percentage of the sale (0–90). */
  commission_percent: "50",
  /** Minimum withdrawal in Naira (~$10). */
  min_withdrawal_naira: "15000",
  /* Homepage content — DB-backed so it's editable on the live site.
     Defaults come from the file-based site settings. */
  hero_badge: siteSettings.heroBadge,
  hero_headline: siteSettings.heroHeadline,
  hero_highlight: siteSettings.heroHighlight,
  hero_subline: siteSettings.heroSubline,
  announcement: siteSettings.announcement,
};

export type ConfigKey = keyof typeof CONFIG_DEFAULTS;

/** All config values in one query (DB overrides merged over defaults). */
export async function getAllConfig(): Promise<Record<ConfigKey, string>> {
  const merged = { ...CONFIG_DEFAULTS };
  const supabase = supabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from("app_config").select("key, value");
    for (const row of data ?? []) {
      if (row.key in merged) merged[row.key as ConfigKey] = row.value;
    }
  }
  return merged;
}

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
