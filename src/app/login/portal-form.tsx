"use client";

import { useActionState } from "react";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestCode, verifyCode, type PortalState } from "./actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export function PortalForm({
  googleEnabled,
  googleError,
}: {
  googleEnabled: boolean;
  googleError?: string;
}) {
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
    <div className="space-y-4">
      {googleEnabled && (
        <>
          <Button asChild variant="outline" className="w-full font-semibold">
            {/* Full page navigation (not a Link) — this route redirects to Google */}
            <a href="/api/auth/google">
              <GoogleIcon /> Continue with Google
            </a>
          </Button>
          {googleError && (
            <p className="text-sm text-red-500">
              Google sign-in didn&apos;t complete — try again or use the email code below.
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
      <form action={requestAction} className="space-y-3">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className={inputClass}
        />
        {current?.error && <p className="text-sm text-red-500">{current.error}</p>}
        <Button type="submit" disabled={requesting} className="w-full font-semibold">
          {requesting ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Email me a login code
        </Button>
      </form>
    </div>
  );
}
