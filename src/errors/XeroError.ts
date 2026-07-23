/**
 * The single structured error type every xero-sdk operation throws.
 * Every call either resolves successfully or rejects with an
 * {@link XeroError} — never a bare `fetch` error or an unhandled
 * exception from an internal helper — so callers can reliably
 * `instanceof` / switch on `.type` instead of parsing message strings.
 */

/** Categorizes the failure so callers can branch on it without parsing message strings. */
export type XeroErrorType =
  | "unauthorized" // 401 - invalid/expired access token
  | "forbidden" // 403 - insufficient scope/permissions
  | "not_found" // 404 - resource does not exist
  | "unprocessable" // 422 - validation error
  | "rate_limited" // 429 - rate limit exceeded
  | "server_error" // 5xx - Xero server error
  | "network_error" // transport/connection/timeout failure
  | "config_error" // invalid library usage / misconfiguration
  | "oauth_error" // OAuth token endpoint failure
  | "abort_error" // request aborted via AbortSignal
  | "unknown";

/** Mirrors one element of `Elements[].ValidationErrors[]` on 422 responses. */
export interface XeroValidationMessage {
  Message: string;
}

/** Mirrors one element of the `Elements` array Xero returns on validation failures. */
export interface XeroValidationElement {
  ValidationErrors?: XeroValidationMessage[];
  [key: string]: unknown;
}

/** Parsed body of an error response, when the body was JSON. */
export interface XeroErrorDetail {
  Type?: string;
  Title?: string;
  Detail?: string;
  Elements?: XeroValidationElement[];
  [key: string]: unknown;
}

export interface XeroErrorOptions {
  status?: number;
  detail?: XeroErrorDetail;
  retryAfter?: number;
  requestId?: string;
  raw?: string;
  cause?: unknown;
}

/**
 * The structured error class thrown by every xero-sdk operation.
 *
 * @example
 * ```ts
 * try {
 *   await client.accounting.getInvoice(token, tenantId, invoiceId);
 * } catch (err) {
 *   if (err instanceof XeroError && err.type === "not_found") {
 *     // handle 404
 *   }
 * }
 * ```
 */
export class XeroError extends Error {
  /** Discriminant for switch/instanceof-free branching. */
  public readonly type: XeroErrorType;
  /** HTTP status code, when the error originated from an HTTP response. */
  public readonly status: number | undefined;
  /** Parsed error body, populated for 403/422/unknown error responses. */
  public readonly detail: XeroErrorDetail | undefined;
  /** Seconds to wait before retrying, populated for `rate_limited` errors. */
  public readonly retryAfter: number | undefined;
  /** Xero's correlation ID for the failed request, if present. */
  public readonly requestId: string | undefined;
  /** Raw response body text, for debugging. */
  public readonly raw: string | undefined;

  constructor(type: XeroErrorType, message: string, options: XeroErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "XeroError";
    this.type = type;
    this.status = options.status;
    this.detail = options.detail;
    this.retryAfter = options.retryAfter;
    this.requestId = options.requestId;
    this.raw = options.raw;
    Object.setPrototypeOf(this, XeroError.prototype);
  }

  static configError(message: string): XeroError {
    return new XeroError("config_error", message);
  }

  static networkError(cause: unknown): XeroError {
    const message = cause instanceof Error ? cause.message : String(cause);
    return new XeroError("network_error", `network error: ${message}`, { cause });
  }

  static abortError(cause?: unknown): XeroError {
    return new XeroError("abort_error", "request aborted", { cause });
  }

  static oauthError(status: number, raw: string): XeroError {
    return new XeroError("oauth_error", `oauth token endpoint returned HTTP ${status}`, {
      status,
      raw,
    });
  }

  /** True if this error type is safe to retry (429 / 5xx / network). */
  isRetryable(): boolean {
    return (
      this.type === "rate_limited" || this.type === "server_error" || this.type === "network_error"
    );
  }
}

/**
 * Maps a completed `Response` (status/headers/body already read into
 * memory by the caller) into a structured {@link XeroError}. Returns
 * `undefined` for non-error statuses.
 */
export function xeroErrorFromResponse(
  status: number,
  headers: Headers,
  bodyText: string,
): XeroError | undefined {
  const requestId =
    headers.get("x-correlation-id") ?? headers.get("xero-correlation-id") ?? undefined;
  const detail = parseDetail(bodyText);

  if (status === 401) {
    return new XeroError(
      "unauthorized",
      "unauthorized - access token missing, invalid, or expired",
      {
        status,
        raw: bodyText,
        requestId,
      },
    );
  }
  if (status === 403) {
    return new XeroError("forbidden", "forbidden - insufficient scope or permissions", {
      status,
      detail,
      raw: bodyText,
      requestId,
    });
  }
  if (status === 404) {
    return new XeroError("not_found", "resource not found", { status, raw: bodyText, requestId });
  }
  if (status === 422) {
    return new XeroError("unprocessable", extractMessage(detail), {
      status,
      detail,
      raw: bodyText,
      requestId,
    });
  }
  if (status === 429) {
    return new XeroError("rate_limited", "rate limit exceeded", {
      status,
      retryAfter: parseRetryAfter(headers),
      raw: bodyText,
      requestId,
    });
  }
  if (status >= 500) {
    return new XeroError("server_error", "xero server error", { status, raw: bodyText, requestId });
  }
  if (status >= 400) {
    return new XeroError("unknown", "unexpected error response", {
      status,
      detail,
      raw: bodyText,
      requestId,
    });
  }
  return undefined;
}

function parseDetail(bodyText: string): XeroErrorDetail | undefined {
  if (!bodyText) return undefined;
  try {
    return JSON.parse(bodyText) as XeroErrorDetail;
  } catch {
    return undefined;
  }
}

function extractMessage(detail: XeroErrorDetail | undefined): string {
  if (!detail) return "validation error";
  if (detail.Title) return detail.Title;
  if (detail.Detail) return detail.Detail;
  for (const el of detail.Elements ?? []) {
    for (const ve of el.ValidationErrors ?? []) {
      if (ve.Message) return ve.Message;
    }
  }
  return "validation error";
}

function parseRetryAfter(headers: Headers): number {
  const v = headers.get("retry-after");
  if (v) {
    const n = Number.parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
  }
  return 60;
}
