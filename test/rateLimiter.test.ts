import { describe, it, expect } from "vitest";
import { RateLimiter } from "../src/http/RateLimiter.js";

describe("RateLimiter", () => {
  it("allows requests under the limit", async () => {
    const limiter = new RateLimiter({ dayLimit: 100, minLimit: 5 });
    for (let i = 0; i < 5; i++) {
      await limiter.wait("tenant-a");
    }
  });

  it("blocks over the per-minute limit until the boundary, then proceeds", async () => {
    let now = Date.UTC(2026, 0, 1, 0, 0, 0);
    const limiter = new RateLimiter({ dayLimit: 1000, minLimit: 2, now: () => now });

    await limiter.wait("tenant-b");
    await limiter.wait("tenant-b");

    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error("timeout")), 50);
    await expect(limiter.wait("tenant-b", controller.signal)).rejects.toThrow();

    // advance past the minute boundary and it should resolve immediately
    now += 61_000;
    await limiter.wait("tenant-b");
  });

  it("reconciles state from response headers", () => {
    const limiter = new RateLimiter();
    limiter.updateFromHeaders("tenant-c", "4999", "59");
    const state = limiter.state("tenant-c");
    expect(state.dayRemaining).toBe(4999);
    expect(state.minRemaining).toBe(59);
  });

  it("tracks tenants independently", async () => {
    const limiter = new RateLimiter({ dayLimit: 1000, minLimit: 1 });
    await limiter.wait("tenant-x");
    await limiter.wait("tenant-y"); // should not be blocked by tenant-x's usage
  });

  it("rejects immediately if signal is already aborted", async () => {
    const limiter = new RateLimiter();
    const controller = new AbortController();
    controller.abort(new Error("already aborted"));
    await expect(limiter.wait("tenant-z", controller.signal)).rejects.toThrow();
  });
});
