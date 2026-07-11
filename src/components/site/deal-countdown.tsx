"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

/** Ms until the next Sunday 23:59:59 — the weekly deal reset. */
function msUntilWeekEnd(now: Date) {
  const end = new Date(now);
  end.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  end.setHours(23, 59, 59, 999);
  return Math.max(0, end.getTime() - now.getTime());
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Urgency strip for discounted products: counts down to the end of the week,
 * when deal prices are reviewed. Renders nothing until mounted (no hydration
 * mismatch) and only appears on products that actually have a slashed price.
 */
export function DealCountdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(msUntilWeekEnd(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null) return null;

  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor((left % 86_400_000) / 3_600_000);
  const minutes = Math.floor((left % 3_600_000) / 60_000);
  const seconds = Math.floor((left % 60_000) / 1000);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        <Timer className="size-4" /> Deal price ends in
      </span>
      <span className="font-mono text-sm font-bold tabular-nums">
        {days > 0 && `${days}d `}
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
      <span className="text-xs text-muted-foreground">— prices reviewed every Sunday night</span>
    </div>
  );
}
