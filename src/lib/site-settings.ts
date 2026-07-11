/**
 * Site-wide settings (hero copy, contact details, social links).
 * Stored in `site-settings-data.json` and editable from /admin/settings.
 */

import settingsData from "./site-settings-data.json";

export type SiteSettings = {
  heroBadge: string;
  heroHeadline: string;
  /** The orange-highlighted part of the headline. */
  heroHighlight: string;
  heroSubline: string;
  /** International format without +, e.g. 2348012345678 */
  whatsappNumber: string;
  contactEmail: string;
  instagram: string;
  twitter: string;
  youtube: string;
};

export const siteSettings = settingsData as SiteSettings;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${siteSettings.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
