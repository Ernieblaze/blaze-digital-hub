"use client";

import { useActionState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SiteSettings } from "@/lib/site-settings";
import {
  addCategory,
  clearOrderHistory,
  deleteCategory,
  saveHomeContent,
  saveSettings,
  type SettingsFormState,
} from "./actions";

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

/** Homepage content — stored in the database, so edits work on the LIVE site. */
export function HomeContentForm({ content }: { content: Record<string, string> }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    saveHomeContent,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <Field label="Announcement bar (top of the homepage — leave empty to hide)">
        <input
          name="announcement"
          defaultValue={content.announcement}
          className={inputClass}
          placeholder="🔥 JAMB Pack ₦5,000 this week only!"
        />
      </Field>
      <Field label="Hero badge (small pill above the headline)">
        <input name="hero_badge" defaultValue={content.hero_badge} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Headline — plain part">
          <input name="hero_headline" defaultValue={content.hero_headline} className={inputClass} />
        </Field>
        <Field label="Headline — orange highlighted part">
          <input name="hero_highlight" defaultValue={content.hero_highlight} className={inputClass} />
        </Field>
      </div>
      <Field label="Hero subline">
        <textarea name="hero_subline" rows={2} defaultValue={content.hero_subline} className={inputClass} />
      </Field>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.saved && <p className="text-sm text-emerald-500">Saved — homepage updates within a minute.</p>}
      <Button type="submit" disabled={pending} className="font-semibold">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save homepage content
      </Button>
    </form>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(saveSettings, null);

  return (
    <form action={action} className="space-y-4">
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

/** Danger zone: wipe the recorded order history so analytics start fresh. */
export function ClearOrderHistoryButton() {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    clearOrderHistory,
    null
  );

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Delete ALL recorded orders? Sales stats and order history restart from zero. Export the CSV from Orders first if you want a copy. This cannot be undone."
          )
        )
          e.preventDefault();
      }}
      className="space-y-2"
    >
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.saved && (
        <p className="text-sm text-emerald-500">Order history cleared — analytics start fresh.</p>
      )}
      <Button type="submit" disabled={pending} variant="destructive" className="font-semibold">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        Clear all order history
      </Button>
    </form>
  );
}
