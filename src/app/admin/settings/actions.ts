"use server";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getProducts } from "@/lib/catalog";
import type { SiteSettings } from "@/lib/site-settings";

const SETTINGS_FILE = path.join(process.cwd(), "src", "lib", "site-settings-data.json");

const READONLY_HINT =
  "Couldn't write the data file. On the live site the file system is read-only — make changes locally, then push to deploy.";

export type SettingsFormState = { error?: string; saved?: boolean } | null;

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const current = JSON.parse(await readFile(SETTINGS_FILE, "utf8")) as SiteSettings;
  const str = (name: keyof SiteSettings) =>
    String(formData.get(name) ?? "").trim() || current[name];

  const next: SiteSettings = {
    // Hero/announcement moved to the DB-backed Homepage content form; the
    // file keeps serving as their default/fallback.
    announcement: str("announcement"),
    heroBadge: str("heroBadge"),
    heroHeadline: str("heroHeadline"),
    heroHighlight: str("heroHighlight"),
    heroSubline: str("heroSubline"),
    whatsappNumber: str("whatsappNumber").replace(/[^\d]/g, "") || current.whatsappNumber,
    contactEmail: str("contactEmail"),
    instagram: str("instagram"),
    facebook: str("facebook"),
    twitter: str("twitter"),
    youtube: str("youtube"),
  };

  try {
    await writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2) + "\n", "utf8");
  } catch {
    return { error: READONLY_HINT };
  }

  revalidateSite();
  return { saved: true };
}

/** Saves the DB-backed homepage content — works on the live site. */
export async function saveHomeContent(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const { setConfig } = await import("@/lib/app-config");
  const fields = [
    "hero_badge",
    "hero_headline",
    "hero_highlight",
    "hero_subline",
    "announcement",
  ] as const;

  for (const key of fields) {
    // Announcement may be cleared (hides the bar); other fields keep their
    // previous value when submitted empty.
    const raw = String(formData.get(key) ?? "").trim();
    if (key === "announcement" || raw) {
      const ok = await setConfig(key, raw);
      if (!ok) return { error: "Couldn't save — is Supabase connected?" };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { saved: true };
}

export async function addCategory(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const { getCategories, setCategories } = await import("@/lib/app-config");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const list = await getCategories();
  if (list.some((c) => c.toLowerCase() === name.toLowerCase())) {
    return { error: `“${name}” already exists.` };
  }

  // DB-backed: works on the live site from any device.
  if (!(await setCategories([...list, name]))) {
    return { error: "Couldn't save — is Supabase connected?" };
  }

  revalidateSite();
  return { saved: true };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");

  const { getCategories, setCategories } = await import("@/lib/app-config");

  const name = String(formData.get("name") ?? "");
  const products = await getProducts();
  // Never orphan products — the UI disables the button, this guards direct POSTs.
  if (products.some((p) => p.category === name)) return;

  const list = await getCategories();
  await setCategories(list.filter((c) => c !== name));
  revalidateSite();
}
