"use client";

import { useActionState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SiteSettings } from "@/lib/site-settings";
import { addCategory, deleteCategory, saveSettings, type SettingsFormState } from "./actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(saveSettings, null);

  return (
    <form action={action} className="space-y-4">
      <Field label="Hero badge (small pill above the headline)">
        <input name="heroBadge" defaultValue={settings.heroBadge} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Headline — plain part">
          <input name="heroHeadline" defaultValue={settings.heroHeadline} className={inputClass} />
        </Field>
        <Field label="Headline — orange highlighted part">
          <input name="heroHighlight" defaultValue={settings.heroHighlight} className={inputClass} />
        </Field>
      </div>
      <Field label="Hero subline">
        <textarea name="heroSubline" rows={2} defaultValue={settings.heroSubline} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp number (international, no + — e.g. 2348012345678)">
          <input name="whatsappNumber" defaultValue={settings.whatsappNumber} className={inputClass} />
        </Field>
        <Field label="Contact email">
          <input name="contactEmail" type="email" defaultValue={settings.contactEmail} className={inputClass} />
        </Field>
        <Field label="Instagram URL">
          <input name="instagram" defaultValue={settings.instagram} className={inputClass} />
        </Field>
        <Field label="Facebook URL">
          <input name="facebook" defaultValue={settings.facebook} className={inputClass} />
        </Field>
        <Field label="X (Twitter) URL">
          <input name="twitter" defaultValue={settings.twitter} className={inputClass} />
        </Field>
        <Field label="YouTube URL">
          <input name="youtube" defaultValue={settings.youtube} className={inputClass} />
        </Field>
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.saved && <p className="text-sm text-emerald-500">Saved — the site is updated.</p>}

      <Button type="submit" disabled={pending} className="font-semibold">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save settings
      </Button>
    </form>
  );
}

export function CategoryManager({
  categories,
  inUse,
}: {
  categories: string[];
  /** Categories that have at least one product (cannot be deleted). */
  inUse: string[];
}) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(addCategory, null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const locked = inUse.includes(c);
          return (
            <Badge key={c} variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-1.5 text-sm">
              {c}
              {locked ? (
                <span className="text-xs text-muted-foreground">(in use)</span>
              ) : (
                <form
                  action={deleteCategory}
                  onSubmit={(e) => {
                    if (!confirm(`Delete category “${c}”?`)) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="name" value={c} />
                  <button
                    type="submit"
                    aria-label={`Delete ${c}`}
                    className="flex size-5 items-center justify-center rounded-full text-red-500 hover:bg-red-500/15"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </form>
              )}
            </Badge>
          );
        })}
      </div>

      <form action={action} className="flex gap-2">
        <input name="name" required placeholder="New category name" className={inputClass} />
        <Button type="submit" disabled={pending} variant="outline" className="shrink-0">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
    </div>
  );
}
