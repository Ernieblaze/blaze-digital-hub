"use server";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getProducts } from "@/lib/catalog";
import type { SiteSettings } from "@/lib/site-settings";

const SETTINGS_FILE = path.join(process.cwd(), "src", "lib", "site-settings-data.json");
const CATEGORIES_FILE = path.join(process.cwd(), "src", "lib", "categories-data.json");

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
    heroBadge: str("heroBadge"),
    heroHeadline: str("heroHeadline"),
    heroHighlight: str("heroHighlight"),
    heroSubline: str("heroSubline"),
    whatsappNumber: str("whatsappNumber").replace(/[^\d]/g, "") || current.whatsappNumber,
    contactEmail: str("contactEmail"),
    instagram: str("instagram"),
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

export async function addCategory(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const list = JSON.parse(await readFile(CATEGORIES_FILE, "utf8")) as string[];
  if (list.some((c) => c.toLowerCase() === name.toLowerCase())) {
    return { error: `“${name}” already exists.` };
  }

  try {
    await writeFile(CATEGORIES_FILE, JSON.stringify([...list, name], null, 2) + "\n", "utf8");
  } catch {
    return { error: READONLY_HINT };
  }

  revalidateSite();
  return { saved: true };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");

  const name = String(formData.get("name") ?? "");
  const products = await getProducts();
  // Never orphan products — the UI disables the button, this guards direct POSTs.
  if (products.some((p) => p.category === name)) return;

  const list = JSON.parse(await readFile(CATEGORIES_FILE, "utf8")) as string[];
  await writeFile(
    CATEGORIES_FILE,
    JSON.stringify(list.filter((c) => c !== name), null, 2) + "\n",
    "utf8"
  );
  revalidateSite();
}
