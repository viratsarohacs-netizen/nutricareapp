// Minimal in-memory rate limiter for auth-sensitive routes.
// Per-serverless-instance (resets on cold start) — a pragmatic first line of
// defence against brute force, not a distributed quota system.

const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false; // limited
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear(); // memory guard
  return true;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
