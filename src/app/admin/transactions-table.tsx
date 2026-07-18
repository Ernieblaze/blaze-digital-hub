"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/products";

type Row = {
  id: number;
  customer_email: string;
  amount_kobo: number;
  status: string;
  channel: string;
  date: string;
};

/** Compact list: 5 rows, "See more" reveals the rest — keeps the page short. */
export function TransactionsTable({ rows }: { rows: Row[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, 5);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Customer</th>
            <th className="pb-2 pr-4 font-medium">Amount</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Channel</th>
            <th className="pb-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((t) => (
            <tr key={t.id} className="border-b last:border-0">
              <td className="py-2 pr-4">{t.customer_email}</td>
              <td className="py-2 pr-4 font-medium">{formatNaira(t.amount_kobo / 100)}</td>
              <td className="py-2 pr-4">
                {t.status === "success" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="size-3.5" /> success
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-500">
                    <XCircle className="size-3.5" /> {t.status}
                  </span>
                )}
              </td>
              <td className="py-2 pr-4">{t.channel}</td>
              <td className="py-2 text-muted-foreground">{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 5 && (
        <div className="mt-3 text-center">
          <Button variant="outline" size="sm" onClick={() => setShowAll((s) => !s)}>
            <ChevronDown className={`size-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
            {showAll ? "Show less" : `See more (${rows.length - 5})`}
          </Button>
        </div>
      )}
    </div>
  );
}
