"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { siteSettings } from "@/lib/site-settings";

/**
 * Slim announcement strip above the navbar. Text comes from site settings
 * (/admin/settings); empty text hides it. Dismissal is remembered per
 * message, so a new announcement shows again.
 */
export function AnnouncementBar({ override }: { override?: string }) {
  // Server pages can pass the DB-backed value; otherwise fall back to the
  // build-time file value.
  const message = (override ?? siteSettings.announcement).trim();
  const storageKey = `blaze-announcement-dismissed:${message}`;
  // Read the "dismissed" flag from localStorage without an effect (hidden on the server).
  const dismissedBefore = useSyncExternalStore(
    subscribeToStorage,
    () => localStorage.getItem(storageKey) === "1",
    () => true,
  );
  const [dismissedNow, setDismissedNow] = useState(false);
  const visible = Boolean(message) && !dismissedBefore && !dismissedNow;

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 text-center text-sm font-medium text-white">
      <span className="min-w-0">{message}</span>
      <button
        aria-label="Dismiss announcement"
        onClick={() => {
          localStorage.setItem(storageKey, "1");
          setDismissedNow(true);
        }}
        className="shrink-0 rounded p-0.5 hover:bg-white/20"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
