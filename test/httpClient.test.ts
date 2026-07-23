import { describe, it, expect } from "vitest";
import { HttpClient } from "../src/http/HttpClient.js";
import { RateLimiter } from "../src/http/RateLimiter.js";
import { noopObserver } from "../src/telemetry/index.js";
import { resolveConfig } from "../src/config.js";
import { XeroError } from "../src/errors/index.js";
import { createMockFetch } from "./helpers/mockFetch.js";

function makeClient(
  fetchImpl: typeof fetch,
  overrides: Partial<Parameters<typeof resolveConfig>[0]> = {},
) {
  const config = resolveConfig({
    clientId: "test-client",
    fetch: fetchImpl,
    retryBaseDelayMs: 1,
    retryMaxDelayMs: 10,
    maxRetries: 3,
    requestTimeoutMs: 2000,
    ...overrides,
  });
  const limiter = new RateLimiter();
  return new HttpClient(config, limiter, noopObserver);
}

describe("HttpClient.request", () => {
  it("returns the response body on success", async () => {
    const fetchImpl = createMockFetch(
      () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const client = makeClient(fetchImpl);

    const response = await client.request({
      method: "GET",
      url: "https://example.com/test",
      tenantId: "t1",
    });
    expect(response.status).toBe(200);
    expect(response.bodyText).toContain("ok");
  });

  it("retries on 500 then succeeds", async () => {
    let attempts = 0;
    const fetchImpl = createMockFetch(() => {
      attempts++;
      if (attempts < 3) return new Response("", { status: 500 });
      return new Response("", { status: 200 });
    });
    const client = makeClient(fetchImpl);

    await client.request({ method: "GET", url: "https://example.com/test", tenantId: "t1" });
    expect(attempts).toBe(3);
  });

  it("does not retry on 404", async () => {
    let attempts = 0;
    const fetchImpl = createMockFetch(() => {
      attempts++;
      return new Response("", { status: 404 });
    });
    const client = makeClient(fetchImpl);

    await expect(
      client.request({ method: "GET", url: "https://example.com/test", tenantId: "t1" }),
    ).rejects.toMatchObject({
      type: "not_found",
    });
    expect(attempts).toBe(1);
  });

  it("exhausts retries on persistent 429", async () => {
    let attempts = 0;
    const fetchImpl = createMockFetch(() => {
      attempts++;
      return new Response("", { status: 429, headers: { "Retry-After": "0" } });
    });
    const client = makeClient(fetchImpl);

    await expect(
      client.request({ method: "GET", url: "https://example.com/test", tenantId: "t1" }),
    ).rejects.toMatchObject({
      type: "rate_limited",
    });
    expect(attempts).toBe(4); // 1 initial + 3 retries
  });

  it("updates the rate limiter from response headers", async () => {
    const fetchImpl = createMockFetch(
      () =>
        new Response("", {
          status: 200,
          headers: { "X-DayLimit-Remaining": "4321", "X-MinLimit-Remaining": "12" },
        }),
    );
    const config = resolveConfig({ clientId: "test-client", fetch: fetchImpl });
    const limiter = new RateLimiter();
    const client = new HttpClient(config, limiter, noopObserver);

    await client.request({ method: "GET", url: "https://example.com/test", tenantId: "t1" });
    const state = limiter.state("t1");
    expect(state.dayRemaining).toBe(4321);
    expect(state.minRemaining).toBe(12);
  });

  it("maps a network-level fetch failure to a XeroError", async () => {
    const fetchImpl = (() => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    const client = makeClient(fetchImpl, { maxRetries: 0 });

    await expect(
      client.request({ method: "GET", url: "https://example.com/test", tenantId: "t1" }),
    ).rejects.toMatchObject({
      type: "network_error",
    });
  });

  it("respects an already-aborted signal", async () => {
    const fetchImpl = createMockFetch(() => new Response("", { status: 200 }));
    const client = makeClient(fetchImpl);
    const controller = new AbortController();
    controller.abort(new Error("cancelled"));

    await expect(
      client.request({
        method: "GET",
        url: "https://example.com/test",
        tenantId: "t1",
        signal: controller.signal,
      }),
    ).rejects.toBeInstanceOf(XeroError);
  });
});
