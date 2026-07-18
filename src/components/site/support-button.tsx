"use client";

import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";

/**
 * Floating support button — opens an email to the business address.
 * Shown on every public page (hidden in /admin).
 */
export function SupportButton({ email }: { email: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={`mailto:${email}?subject=${encodeURIComponent("Question about Blaze Digital Hub")}`}
      aria-label="Email support"
      className="fixed right-4 bottom-4 z-50 flex size-13 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-black/25 transition-transform hover:scale-110 sm:right-6 sm:bottom-6"
    >
      <Mail className="size-6" />
    </a>
  );
}
