import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600">
        <Flame className="size-7 text-white" />
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        This page doesn&apos;t exist — but the hustle continues. Head back to the shop.
      </p>
      <Button asChild size="lg" className="font-semibold">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
