import type { ResolvedXeroConfig } from "../config.js";
import type { RateLimiter } from "./RateLimiter.js";
import type { XeroObserver } from "../telemetry/index.js";
import { XeroError, xeroErrorFromResponse } from "../errors/index.js";

export interface XeroRequest {
  method: string;
  url: string;
  /** Low-cardinality path for telemetry, e.g. "/Invoices/{id}". Auto-derived from `url` if omitted. */
  logicalPath?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  tenantId?: string;
  idempotencyKey?: string;
  /** Bypasses client-side throttling for this single call (OAuth token endpoint, App Store partner API). */
  skipRateLimit?: boolean;
  signal?: AbortSignal;
}

export interface XeroResponse {
  status: number;
  headers: Headers;
  /** Raw response body text. Empty string for 204/empty bodies. */
  bodyText: string;
}

/** Parses `bodyText` as JSON. Returns `undefined` for an empty body. */
export function parseJson<T>(response: XeroResponse): T | undefined {
  if (!response.bodyText) return undefined;
  try {
    return JSON.parse(response.bodyText) as T;
  } catch (err) {
    throw XeroError.configError(`failed to decode response JSON: ${String(err)}`);
  }
}

/**
 * The shared low-level HTTP transport: owns retries with exponential
 * backoff + jitter, per-tenant rate-limit coordination, structured
 * error mapping, and telemetry emission, so every domain resource is a
 * thin, consistent wrapper around {@link HttpClient.request}.
 */
export class HttpClient {
  constructor(
    private readonly config: ResolvedXeroConfig,
    private readonly limiter: RateLimiter | undefined,
    private readonly observer: XeroObserver,
  ) {}

  async request(req: XeroRequest): Promise<XeroResponse> {
    if (!req.skipRateLimit && this.limiter && !this.config.disableRateLimit) {
      try {
        await this.limiter.wait(req.tenantId ?? "", req.signal);
      } catch (err) {
        throw isAbort(err) ? XeroError.abortError(err) : XeroError.networkError(err);
      }
    }

    const logicalPath = req.logicalPath ?? toLogicalPath(req.url);
    const maxAttempts = this.config.maxRetries + 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const start = performance.now();
      try {
        const response = await this.doOnce(req);
        const durationMs = performance.now() - start;

        if (this.limiter && !this.config.disableRateLimit) {
          const day = response.headers.get("x-daylimit-remaining");
          const min = response.headers.get("x-minlimit-remaining");
          if (day !== null || min !== null) {
            this.limiter.updateFromHeaders(req.tenantId ?? "", day, min);
          }
        }

        if (response.status >= 200 && response.status < 300) {
          this.observer.onRequest({
            method: req.method,
            path: logicalPath,
            tenantId: req.tenantId,
            status: response.status,
            durationMs,
            attempt,
            retried: false,
            error: undefined,
          });
          return response;
        }

        const xeroErr =
          xeroErrorFromResponse(response.status, response.headers, response.bodyText) ??
          new XeroError("unknown", `unexpected response status ${response.status}`, {
            status: response.status,
          });
        const shouldRetry = xeroErr.isRetryable() && attempt < maxAttempts;
        this.observer.onRequest({
          method: req.method,
          path: logicalPath,
          tenantId: req.tenantId,
          status: response.status,
          durationMs,
          attempt,
          retried: shouldRetry,
          error: xeroErr,
        });
        lastError = xeroErr;
        if (!shouldRetry) throw xeroErr;

        const retryAfterMs = xeroErr.retryAfter ? xeroErr.retryAfter * 1000 : 0;
        await backoffDelay(
          this.config.retryBaseDelayMs,
          this.config.retryMaxDelayMs,
          attempt,
          retryAfterMs,
          req.signal,
        );
      } catch (err) {
        if (err instanceof XeroError) {
          if (!err.isRetryable() || attempt >= maxAttempts) throw err;
          lastError = err;
          const retryAfterMs = err.retryAfter ? err.retryAfter * 1000 : 0;
          await backoffDelay(
            this.config.retryBaseDelayMs,
            this.config.retryMaxDelayMs,
            attempt,
            retryAfterMs,
            req.signal,
          );
          continue;
        }

        const durationMs = performance.now() - start;
        const mapped = isAbort(err) ? XeroError.abortError(err) : XeroError.networkError(err);
        this.observer.onRequest({
          method: req.method,
          path: logicalPath,
          tenantId: req.tenantId,
          status: 0,
          durationMs,
          attempt,
          retried: mapped.isRetryable() && attempt < maxAttempts,
          error: mapped,
        });
        lastError = mapped;
        if (mapped.type === "abort_error" || attempt >= maxAttempts) throw mapped;
        await backoffDelay(
          this.config.retryBaseDelayMs,
          this.config.retryMaxDelayMs,
          attempt,
          0,
          req.signal,
        );
      }
    }

    throw lastError instanceof Error ? lastError : XeroError.networkError(lastError);
  }

  private async doOnce(req: XeroRequest): Promise<XeroResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new Error("request timed out")),
      this.config.requestTimeoutMs,
    );
    const onOuterAbort = (): void => controller.abort(req.signal?.reason);
    req.signal?.addEventListener("abort", onOuterAbort, { once: true });

    try {
      const headers = new Headers(req.headers);
      if (!headers.has("User-Agent") && !headers.has("user-agent")) {
        headers.set("User-Agent", this.config.userAgent);
      }
      if (req.idempotencyKey) headers.set("Idempotency-Key", req.idempotencyKey);
      if (req.tenantId) headers.set("Xero-Tenant-Id", req.tenantId);

      let response: Response;
      try {
        response = await this.config.fetch(req.url, {
          method: req.method,
          headers,
          body: req.body ?? null,
          signal: controller.signal,
        });
      } catch (err) {
        if (controller.signal.aborted && req.signal?.aborted) throw XeroError.abortError(err);
        if (controller.signal.aborted) throw XeroError.networkError(new Error("request timed out"));
        throw XeroError.networkError(err);
      }

      const bodyText = await response.text();
      return { status: response.status, headers: response.headers, bodyText };
    } finally {
      clearTimeout(timeout);
      req.signal?.removeEventListener("abort", onOuterAbort);
    }
  }
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function toLogicalPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname
      .split("/")
      .map((seg) => (looksLikeId(seg) ? "{id}" : seg))
      .join("/");
  } catch {
    return url;
  }
}

function looksLikeId(seg: string): boolean {
  if (seg.length < 8) return false;
  let hasDigit = false;
  for (const ch of seg) {
    if (ch >= "0" && ch <= "9") hasDigit = true;
    else if (!((ch >= "a" && ch <= "f") || (ch >= "A" && ch <= "F") || ch === "-")) return false;
  }
  return hasDigit;
}

/** Exponential backoff with jitter, capped at `maxDelayMs`. Uses Web Crypto for jitter. */
async function backoffDelay(
  baseMs: number,
  maxDelayMs: number,
  attempt: number,
  minDelayMs: number,
  signal?: AbortSignal,
): Promise<void> {
  const shift = Math.min(attempt - 1, 20);
  let delay = Math.min(baseMs * 2 ** shift, maxDelayMs);
  const half = delay / 2;
  const jitter = randomInt(Math.floor(half) + 1);
  delay = Math.max(half + jitter, minDelayMs);
  delay = Math.min(delay, maxDelayMs);

  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(XeroError.abortError(signal.reason));
      return;
    }
    const timer = setTimeout(resolve, delay);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(XeroError.abortError(signal.reason));
      },
      { once: true },
    );
  });
}

/** Cryptographically random integer in [0, max) using Web Crypto. */
function randomInt(max: number): number {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  getRandomValuesFn()(buf);
  return buf[0]! % max;
}

function getRandomValuesFn(): (typed: Uint32Array) => Uint32Array {
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto?.getRandomValues) return g.crypto.getRandomValues.bind(g.crypto);
  throw XeroError.configError(
    "xero-sdk: no Web Crypto API available (globalThis.crypto.getRandomValues). Use Node.js >= 19 or a browser.",
  );
}
