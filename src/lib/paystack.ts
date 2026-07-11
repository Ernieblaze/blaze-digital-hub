/**
 * Paystack API helpers — SERVER ONLY (uses the secret key).
 *
 * Set PAYSTACK_SECRET_KEY in .env.local (test key sk_test_… works too).
 * Until it's set, the admin dashboard shows a "connect Paystack" notice
 * instead of live numbers.
 */

const PAYSTACK_API = "https://api.paystack.co";

export type PaystackTransaction = {
  id: number;
  reference: string;
  status: "success" | "failed" | "abandoned" | string;
  /** Amount in kobo. */
  amount: number;
  currency: string;
  channel: string;
  paid_at: string | null;
  created_at: string;
  customer: { email: string; first_name?: string | null; last_name?: string | null };
};

export type PaystackStats = {
  /** Total volume of successful payments, in Naira. */
  totalRevenue: number;
  successfulCount: number;
  failedCount: number;
  totalCount: number;
  /** Percentage 0–100 of fetched transactions that succeeded. */
  successRate: number;
  /** Average successful order value, in Naira. */
  averageOrder: number;
  /** Most recent transactions, newest first. */
  recent: PaystackTransaction[];
};

export function isPaystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

async function paystackGet<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Paystack ${path} responded ${res.status}`);
  }
  const json = (await res.json()) as { status: boolean; message: string; data: T };
  if (!json.status) {
    throw new Error(`Paystack ${path}: ${json.message}`);
  }
  return json.data;
}

/**
 * Fetches the latest transactions and aggregates them into dashboard stats.
 * Returns null when the key is missing or the API call fails, so the
 * dashboard can render a friendly notice instead of crashing.
 */
export async function getPaystackStats(): Promise<PaystackStats | null> {
  if (!isPaystackConfigured()) return null;

  try {
    const transactions = await paystackGet<PaystackTransaction[]>(
      "/transaction?perPage=100"
    );

    const successful = transactions.filter((t) => t.status === "success");
    const failed = transactions.filter((t) => t.status === "failed");
    const totalRevenueKobo = successful.reduce((sum, t) => sum + t.amount, 0);
    const totalRevenue = totalRevenueKobo / 100;

    return {
      totalRevenue,
      successfulCount: successful.length,
      failedCount: failed.length,
      totalCount: transactions.length,
      successRate:
        transactions.length === 0
          ? 0
          : Math.round((successful.length / transactions.length) * 100),
      averageOrder: successful.length === 0 ? 0 : totalRevenue / successful.length,
      recent: transactions.slice(0, 10),
    };
  } catch (error) {
    console.error("[paystack] failed to load stats:", error);
    return null;
  }
}
