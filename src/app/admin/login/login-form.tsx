"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <form action={action} className="space-y-3">
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Admin password"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full font-semibold">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Enter dashboard
      </Button>
    </form>
  );
}
