import type { NextRequest } from "next/server";

const store = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) store.delete(key);
  }
}

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const geo = (request as unknown as { geo?: { ip?: string } }).geo;
  if (geo?.ip) return geo.ip;
  return "unknown";
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { ok: true; remaining: number } | { ok: false; retryAfter: number } {
  cleanup();
  const key = options.keyPrefix ? `${options.keyPrefix}:${identifier}` : identifier;
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + options.windowMs };
    store.set(key, entry);
    return { ok: true, remaining: options.max - 1 };
  }
  entry.count += 1;
  if (entry.count > options.max) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: options.max - entry.count };
}

export const DEMO_API_LIMIT = { windowMs: 60_000, max: 15 } as const;

export function rateLimitResponse(
  request: NextRequest,
  options: RateLimitOptions = DEMO_API_LIMIT
): Response | null {
  const result = checkRateLimit(getClientIdentifier(request), options);
  if (result.ok) return null;
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please slow down and try again later.",
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfter),
      },
    }
  );
}
