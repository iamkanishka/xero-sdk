/**
 * Dependency-free observability hook. xero-sdk calls into this for
 * every request attempt, rate-limit header update, and token refresh.
 * The SDK intentionally does not import OpenTelemetry or any
 * metrics/tracing/logging library directly — implement this small
 * interface and adapt it to whatever stack you use. A no-op observer
 * is used by default.
 */

export interface RequestEvent {
  method: string;
  /** Low-cardinality path for telemetry, e.g. "/Invoices/{id}" with IDs collapsed and no query string. */
  path: string;
  tenantId: string | undefined;
  status: number;
  durationMs: number;
  /** 1-indexed attempt number. */
  attempt: number;
  retried: boolean;
  error: unknown;
}

export interface RateLimitEvent {
  tenantId: string;
  dayRemaining: number;
  minRemaining: number;
}

export interface XeroObserver {
  onRequest(event: RequestEvent): void;
  onRateLimit(event: RateLimitEvent): void;
  onTokenRefreshed(key: string): void;
  onTokenRefreshFailed(key: string, error: unknown): void;
}

/** The default {@link XeroObserver}: discards all events. */
export const noopObserver: XeroObserver = {
  onRequest: () => undefined,
  onRateLimit: () => undefined,
  onTokenRefreshed: () => undefined,
  onTokenRefreshFailed: () => undefined,
};
