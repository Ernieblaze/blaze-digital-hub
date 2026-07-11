"use client";

import { useActionState, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitReview, type ReviewFormState } from "./actions";

/** Star-rating + comment form shown under each purchase in My Account. */
export function ReviewForm({
  slug,
  existingRating,
  existingComment,
}: {
  slug: string;
  existingRating?: number;
  existingComment?: string;
}) {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(submitReview, null);
  const [rating, setRating] = useState(existingRating ?? 0);
  const [open, setOpen] = useState(false);

  if (state?.ok) {
    return <p className="text-xs text-emerald-500">Review saved — thank you! It's live on the product page. ⭐</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-primary hover:underline"
      >
        {existingRating ? "Edit your review" : "⭐ Rate this product"}
      </button>
    );
  }

  return (
    <form action={action} className="mt-2 space-y-2 rounded-lg border p-3">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={2}
        defaultValue={existingComment}
        placeholder="What did it do for you? (optional but powerful)"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending || rating === 0} className="font-semibold">
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null} Submit review
      </Button>
    </form>
  );
}
