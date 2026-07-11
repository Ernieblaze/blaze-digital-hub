import { formatNaira } from "@/lib/products";

export type DailyRevenue = { day: string; total: number; count: number };

/** Groups raw orders into per-day revenue for the last `days` days. */
export function groupDailyRevenue(
  orders: { amount_kobo: number; paid_at: string }[],
  days = 30
): DailyRevenue[] {
  const buckets = new Map<string, { total: number; count: number }>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { total: 0, count: 0 });
  }
  for (const o of orders) {
    const key = o.paid_at.slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.total += o.amount_kobo / 100;
      bucket.count += 1;
    }
  }
  return [...buckets.entries()].map(([day, v]) => ({ day, ...v }));
}

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

/**
 * Revenue-per-day bar chart, last 30 days. Single series (no legend — the
 * title names it), brand orange validated against both light and dark
 * surfaces, recessive grid, peak-only direct label, per-bar tooltips, and a
 * screen-reader table fallback.
 */
export function RevenueChart({ data }: { data: DailyRevenue[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const peakIndex = data.findIndex((d) => d.total === max && max > 0);

  const W = 720;
  const H = 200;
  const PAD_L = 8;
  const PAD_B = 22;
  const plotH = H - PAD_B - 14;
  const step = (W - PAD_L * 2) / data.length;
  const barW = Math.max(4, step - 2); // ≥2px gap between bars

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Revenue per day, last 30 days"
        className="w-full"
      >
        {/* recessive grid */}
        {gridLines.map((g) => (
          <line
            key={g}
            x1={PAD_L}
            x2={W - PAD_L}
            y1={14 + plotH * (1 - g)}
            y2={14 + plotH * (1 - g)}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        ))}
        {/* baseline */}
        <line
          x1={PAD_L}
          x2={W - PAD_L}
          y1={14 + plotH}
          y2={14 + plotH}
          className="stroke-muted-foreground/40"
          strokeWidth="1"
        />
        {data.map((d, i) => {
          const h = d.total === 0 ? 0 : Math.max(3, (d.total / max) * plotH);
          const x = PAD_L + i * step + (step - barW) / 2;
          const y = 14 + plotH - h;
          return (
            <g key={d.day}>
              {/* hover target larger than the mark */}
              <rect x={PAD_L + i * step} y={14} width={step} height={plotH} fill="transparent">
                <title>{`${shortDay(d.day)} — ${formatNaira(d.total)} (${d.count} order${d.count === 1 ? "" : "s"})`}</title>
              </rect>
              {d.total > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="4"
                  fill="#ea580c"
                  className="pointer-events-none"
                />
              )}
              {/* peak-only direct label */}
              {i === peakIndex && d.total > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-semibold"
                >
                  {formatNaira(d.total)}
                </text>
              )}
              {/* sparse x-axis labels: first, middle, last */}
              {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                <text
                  x={PAD_L + i * step + step / 2}
                  y={H - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {shortDay(d.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* table fallback for screen readers */}
      <table className="sr-only">
        <caption>Revenue per day, last 30 days</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Revenue</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{formatNaira(d.total)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
