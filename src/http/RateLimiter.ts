/**
 * Client-side, per-tenant rate limiting that mirrors Xero's published
 * limits (60 requests/minute and 5,000 requests/day per tenant), so
 * well-behaved clients back off *before* hitting a 429 rather than
 * only reacting after the fact. Self-corrects using the
 * `X-DayLimit-Remaining` / `X-MinLimit-Remaining` response headers
 * Xero sends on every Accounting API response.
 */

export const DEFAULT_DAY_LIMIT = 5000;
export const DEFAULT_MIN_LIMIT = 60;

interface Bucket {
  dayUsed: number;
  dayWindow: number; // unix day
  minUsed: number;
  minWindow: number; // unix minute
  dayRemaining: number;
  minRemaining: number;
  haveHeaderHint: boolean;
}

export interface RateLimiterOptions {
  dayLimit?: number;
  minLimit?: number;
  /** Injectable clock, primarily for tests. */
  now?: () => number;
}

export interface RateLimitState {
  dayRemaining: number;
  minRemaining: number;
}

/**
 * Tracks request usage per tenant ID and blocks (via {@link wait})
 * until the caller is safe to proceed under Xero's published limits.
 */
export class RateLimiter {
  private readonly tenants = new Map<string, Bucket>();
  private readonly dayLimit: number;
  private readonly minLimit: number;
  private readonly now: () => number;

  constructor(options: RateLimiterOptions = {}) {
    this.dayLimit = options.dayLimit ?? DEFAULT_DAY_LIMIT;
    this.minLimit = options.minLimit ?? DEFAULT_MIN_LIMIT;
    this.now = options.now ?? (() => Date.now());
  }

  private getBucket(tenantId: string): Bucket {
    let b = this.tenants.get(tenantId);
    const nowMs = this.now();
    const day = Math.floor(nowMs / 86_400_000);
    const min = Math.floor(nowMs / 60_000);

    if (!b) {
      b = {
        dayUsed: 0,
        dayWindow: day,
        minUsed: 0,
        minWindow: min,
        dayRemaining: this.dayLimit,
        minRemaining: this.minLimit,
        haveHeaderHint: false,
      };
      this.tenants.set(tenantId, b);
    }
    if (b.dayWindow !== day) {
      b.dayWindow = day;
      b.dayUsed = 0;
      if (!b.haveHeaderHint) b.dayRemaining = this.dayLimit;
    }
    if (b.minWindow !== min) {
      b.minWindow = min;
      b.minUsed = 0;
      if (!b.haveHeaderHint) b.minRemaining = this.minLimit;
    }
    return b;
  }

  /**
   * Resolves once it is safe to issue a request for `tenantId`, or
   * rejects if `signal` is aborted first. `tenantId` may be `""` for
   * requests that don't carry a tenant (OAuth token endpoint, App
   * Store partner API) — those share a single bucket with the same
   * limits.
   */
  async wait(tenantId: string, signal?: AbortSignal): Promise<void> {
    for (;;) {
      signal?.throwIfAborted();
      const b = this.getBucket(tenantId);
      const dayOk = b.dayUsed < this.dayLimit;
      const minOk = b.minUsed < this.minLimit;
      if (dayOk && minOk) {
        b.dayUsed++;
        b.minUsed++;
        return;
      }

      const waitMs = dayOk ? nextMinuteBoundaryMs(this.now()) : nextMidnightUtcMs(this.now());
      await sleep(waitMs, signal);
    }
  }

  /**
   * Reconciles the local bucket with the authoritative remaining-count
   * headers Xero returns on every response, so client-side tracking
   * can't drift from server-side truth.
   */
  updateFromHeaders(
    tenantId: string,
    dayRemainingHeader: string | null,
    minRemainingHeader: string | null,
  ): void {
    const day = dayRemainingHeader !== null ? Number.parseInt(dayRemainingHeader, 10) : NaN;
    const min = minRemainingHeader !== null ? Number.parseInt(minRemainingHeader, 10) : NaN;
    if (Number.isNaN(day) && Number.isNaN(min)) return;

    const b = this.getBucket(tenantId);
    b.haveHeaderHint = true;
    if (!Number.isNaN(day)) {
      b.dayRemaining = day;
      b.dayUsed = Math.max(0, this.dayLimit - day);
    }
    if (!Number.isNaN(min)) {
      b.minRemaining = min;
      b.minUsed = Math.max(0, this.minLimit - min);
    }
  }

  /** Last-known remaining counts for a tenant, without mutating anything. */
  state(tenantId: string): RateLimitState {
    const b = this.getBucket(tenantId);
    return { dayRemaining: b.dayRemaining, minRemaining: b.minRemaining };
  }
}

function nextMinuteBoundaryMs(nowMs: number): number {
  const sec = Math.floor(nowMs / 1000);
  const next = (Math.floor(sec / 60) + 1) * 60;
  return (next - sec) * 1000;
}

function nextMidnightUtcMs(nowMs: number): number {
  const d = new Date(nowMs);
  const tomorrow = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0);
  return tomorrow - nowMs;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason instanceof Error ? signal.reason : new Error("aborted"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal?.reason instanceof Error ? signal.reason : new Error("aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
