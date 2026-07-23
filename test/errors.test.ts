import { describe, it, expect } from "vitest";
import { XeroError, xeroErrorFromResponse } from "../src/errors/index.js";

function headers(init: Record<string, string> = {}): Headers {
  return new Headers(init);
}

describe("xeroErrorFromResponse", () => {
  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [422, "unprocessable"],
    [429, "rate_limited"],
    [500, "server_error"],
    [502, "server_error"],
  ] as const)("maps status %d to type %s", (status, type) => {
    const err = xeroErrorFromResponse(status, headers(), "");
    expect(err).toBeDefined();
    expect(err?.type).toBe(type);
    expect(err?.status).toBe(status);
  });

  it("returns undefined for 2xx statuses", () => {
    expect(xeroErrorFromResponse(200, headers(), "")).toBeUndefined();
  });

  it("parses validation detail on 422", () => {
    const body = JSON.stringify({
      Type: "ValidationException",
      Title: "A validation exception occurred",
      Elements: [{ ValidationErrors: [{ Message: "Contact must be specified" }] }],
    });
    const err = xeroErrorFromResponse(422, headers(), body);
    expect(err?.detail).toBeDefined();
    expect(err?.message).toBe("A validation exception occurred");
  });

  it("reads Retry-After header on 429", () => {
    const err = xeroErrorFromResponse(429, headers({ "retry-after": "42" }), "");
    expect(err?.retryAfter).toBe(42);
  });

  it("defaults Retry-After to 60 when missing", () => {
    const err = xeroErrorFromResponse(429, headers(), "");
    expect(err?.retryAfter).toBe(60);
  });
});

describe("XeroError", () => {
  it("isRetryable is true for rate_limited/server_error/network_error", () => {
    expect(new XeroError("rate_limited", "x").isRetryable()).toBe(true);
    expect(new XeroError("server_error", "x").isRetryable()).toBe(true);
    expect(new XeroError("network_error", "x").isRetryable()).toBe(true);
    expect(new XeroError("not_found", "x").isRetryable()).toBe(false);
    expect(new XeroError("config_error", "x").isRetryable()).toBe(false);
  });

  it("configError sets type and message", () => {
    const err = XeroError.configError("missing tenant id");
    expect(err.type).toBe("config_error");
    expect(err.message).toBe("missing tenant id");
  });

  it("is an instanceof Error and XeroError", () => {
    const err = XeroError.configError("x");
    expect(err instanceof Error).toBe(true);
    expect(err instanceof XeroError).toBe(true);
  });
});
