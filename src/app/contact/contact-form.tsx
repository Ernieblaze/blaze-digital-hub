"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendContactMessage, type ContactState } from "./actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendContactMessage,
    null
  );

  if (state?.ok) {
    return (
      <p className="flex items-center gap-2 py-6 text-emerald-500">
        <CheckCircle2 className="size-5" /> Message sent — we usually reply within a few hours! 🔥
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className={inputClass} />
        <input name="email" type="email" required placeholder="Your email" className={inputClass} />
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="How can we help?"
        className={inputClass}
      />
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <Button type="submit" disabled={pending} className="font-semibold">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send message
      </Button>
    </form>
  );
}
