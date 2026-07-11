import { Flame } from "lucide-react";

/** Global route-transition loading state. */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
          <Flame className="size-7 text-white" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">Loading the heat…</p>
      </div>
    </div>
  );
}
