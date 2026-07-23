import { describe, it, expect, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MemoryTokenStore, FileTokenStore } from "../src/auth/TokenStore.js";
import type { XeroToken } from "../src/auth/Token.js";

const sampleToken: XeroToken = {
  accessToken: "AT",
  refreshToken: "RT",
  tokenType: "Bearer",
  scopes: [],
  obtainedAt: Date.now(),
  expiresAt: Date.now() + 3_600_000,
};

describe("MemoryTokenStore", () => {
  it("put/get/delete round-trips", async () => {
    const store = new MemoryTokenStore();
    await store.put("user-1", sampleToken);

    const got = await store.get("user-1");
    expect(got?.accessToken).toBe("AT");

    await store.delete("user-1");
    expect(await store.get("user-1")).toBeUndefined();
  });

  it("keys() lists every stored key", async () => {
    const store = new MemoryTokenStore();
    await store.put("a", sampleToken);
    await store.put("b", sampleToken);
    expect(await store.keys()).toEqual(expect.arrayContaining(["a", "b"]));
  });
});

describe("FileTokenStore", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function tempPath(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), "xero-sdk-test-"));
    tempDirs.push(dir);
    return join(dir, "tokens.json");
  }

  it("persists tokens across store instances", async () => {
    const path = await tempPath();
    const store1 = await FileTokenStore.create(path);
    await store1.put("user-1", sampleToken);

    const store2 = await FileTokenStore.create(path);
    const got = await store2.get("user-1");
    expect(got?.accessToken).toBe("AT");
  });

  it("supports keys() and delete()", async () => {
    const path = await tempPath();
    const store = await FileTokenStore.create(path);
    await store.put("a", sampleToken);
    await store.put("b", sampleToken);

    expect(await store.keys()).toHaveLength(2);
    await store.delete("a");
    expect(await store.keys()).toHaveLength(1);
  });

  it("serializes concurrent writes without corrupting the file", async () => {
    const path = await tempPath();
    const store = await FileTokenStore.create(path);

    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        store.put(`key-${i}`, { ...sampleToken, accessToken: `AT-${i}` }),
      ),
    );

    const keys = await store.keys();
    expect(keys).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      const tok = await store.get(`key-${i}`);
      expect(tok?.accessToken).toBe(`AT-${i}`);
    }
  });
});
