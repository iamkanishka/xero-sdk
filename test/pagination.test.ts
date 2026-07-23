import { describe, it, expect } from "vitest";
import { paginate, collectAll, forEachPage, PAGE_SIZE } from "../src/pagination/index.js";

function makeFetcher(totalPages: number, lastPageSize: number) {
  return (page: number): Promise<number[]> => {
    if (page > totalPages) return Promise.resolve([]);
    const size = page === totalPages ? lastPageSize : PAGE_SIZE;
    return Promise.resolve(Array.from({ length: size }, (_, i) => (page - 1) * PAGE_SIZE + i));
  };
}

describe("collectAll", () => {
  it("concatenates every page", async () => {
    const items = await collectAll(makeFetcher(3, 40));
    expect(items).toHaveLength(2 * PAGE_SIZE + 40);
  });

  it("propagates fetch errors", async () => {
    const boom = new Error("boom");
    await expect(collectAll(() => Promise.reject(boom))).rejects.toBe(boom);
  });
});

describe("paginate", () => {
  it("lazily async-iterates every item", async () => {
    let count = 0;
    for await (const item of paginate(makeFetcher(2, 10))) {
      expect(typeof item).toBe("number");
      count++;
    }
    expect(count).toBe(PAGE_SIZE + 10);
  });

  it("stops after a short final page without over-fetching", async () => {
    let calls = 0;
    const fetcher = (page: number): Promise<number[]> => {
      calls++;
      return makeFetcher(1, 5)(page);
    };
    const items: number[] = [];
    for await (const item of paginate(fetcher)) items.push(item);
    expect(items).toHaveLength(5);
    expect(calls).toBe(1);
  });
});

describe("forEachPage", () => {
  it("stops early when the callback returns false", async () => {
    let seen = 0;
    await forEachPage(makeFetcher(2, 10), () => {
      seen++;
      if (seen === 5) return false;
      return undefined;
    });
    expect(seen).toBe(5);
  });
});
