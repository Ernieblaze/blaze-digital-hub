"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ slug, name }: { slug: string; name: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!confirm(`Delete “${name}”? This removes it from the shop immediately.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
