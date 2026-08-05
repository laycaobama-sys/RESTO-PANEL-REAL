// ============================================================================
// RestoPanel · Simple in-memory rate limiter
// ----------------------------------------------------------------------------
// Used by /api/auth/login and /api/auth/register to throttle brute-force
// attempts. NOT suitable for multi-instance deployments — for production move
// the counter to Redis (or Cloudflare KV / Durable Objects). The interface
// is intentionally small so the storage backend can be swapped without
// touching the call sites.
// ============================================================================

interface Bucket {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Maximum attempts allowed inside the window before blocking. */
  maxAttempts?: number;
  /** Window length in ms during which attempts are counted. */
  windowMs?: number;
  /** How long to block the key once the limit is exceeded. */
  blockMs?: number;
}

const DEFAULTS: Required<RateLimitOptions> = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 min
  blockMs: 15 * 60 * 1000, // 15 min
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Records an attempt and reports whether the caller is still allowed to
 * proceed. Call this *before* doing the expensive work (DB lookup, hash
 * compare) so attackers cannot amortise cost against the limit.
 */
export function consumeRateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const opts = { ...DEFAULTS, ...options };
  const now = Date.now();
  const bucket = buckets.get(key);

  // Currently blocked?
  if (bucket?.blockedUntil && bucket.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.blockedUntil - now,
    };
  }

  // Expired bucket → reset.
  if (bucket && now - bucket.firstAttemptAt > opts.windowMs) {
    buckets.delete(key);
  }

  const current = buckets.get(key) ?? {
    count: 0,
    firstAttemptAt: now,
  };

  current.count += 1;
  buckets.set(key, current);

  if (current.count > opts.maxAttempts) {
    current.blockedUntil = now + opts.blockMs;
    buckets.set(key, current);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: opts.blockMs,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, opts.maxAttempts - current.count),
    retryAfterMs: 0,
  };
}

/**
 * Resets a specific key (or all keys when called with no argument). Used by
 * the test suite to isolate cases.
 */
export function resetRateLimit(key?: string): void {
  if (key) buckets.delete(key);
  else buckets.clear();
}
