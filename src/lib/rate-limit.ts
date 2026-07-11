/**
 * Lightweight sliding-window rate limiter — SERVER ONLY.
 *
 * In-memory per server instance: on serverless this resets when an instance
 * recycles, so it's a speed bump against brute force rather than a bank
 * vault — exactly the right trade-off for a password/code form (the codes
 * themselves already expire in 15 minutes).
 */

const buckets = new Map<string, number[]>();

/** Returns true if the action is allowed, false if the key is over the limit. */
export function rateLimit(key: string, max = 5, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}
