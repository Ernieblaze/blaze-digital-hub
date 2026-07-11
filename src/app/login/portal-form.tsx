"use client";

import { useActionState } from "react";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestCode, verifyCode, type PortalState } from "./actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PortalForm() {
  const [state, requestAction, requesting] = useActionState<PortalState, FormData>(
    requestCode,
    null
  );
  const [verifyState, verifyAction, verifying] = useActionState<PortalState, FormData>(
    verifyCode,
    null
  );

  // The verify step's own errors take over once it has been attempted.
  const current = verifyState ?? state;

  if (current?.step === "verify") {
    return (
      <form action={verifyAction} className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <strong className="text-foreground">{current.email}</strong>.
          Enter it below (check spam too).
        </p>
        <input type="hidden" name="email" value={current.email} />
        <input
          name="code"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="6-digit code"
          className={`${inputClass} text-center text-lg tracking-[0.5em]`}
        />
        {current.error && <p className="text-sm text-red-500">{current.error}</p>}
        <Button type="submit" disabled={verifying} className="w-full font-semibold">
          {verifying ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          Unlock my downloads
        </Button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-3">
      <input
        type="email"
        name="email"
        required
        autoFocus
        placeholder="Your email address"
        className={inputClass}
      />
      {current?.error && <p className="text-sm text-red-500">{current.error}</p>}
      <Button type="submit" disabled={requesting} className="w-full font-semibold">
        {requesting ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        Email me a login code
      </Button>
    </form>
  );
}
