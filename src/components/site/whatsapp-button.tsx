"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

/**
 * Floating WhatsApp chat button — shown on every public page (hidden in /admin).
 * The number comes from site settings (editable at /admin/settings).
 */
export function WhatsAppButton({ href }: { href: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex size-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform hover:scale-110 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-6" fill="currentColor" strokeWidth={0} />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
    </a>
  );
}
