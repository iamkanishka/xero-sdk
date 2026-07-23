import { describe, it, expect } from "vitest";
import { OAuthClient, generatePkce } from "../src/auth/OAuthClient.js";
import { HttpClient } from "../src/http/HttpClient.js";
import { RateLimiter } from "../src/http/RateLimiter.js";
import { noopObserver } from "../src/telemetry/index.js";
import { resolveConfig } from "../src/config.js";
import { createMockFetch, jsonResponse } from "./helpers/mockFetch.js";

function makeOAuthClient(fetchImpl: typeof fetch, overrides: Record<string, unknown> = {}) {
  const config = resolveConfig({
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    redirectUri: "https://example.com/callback",
    scopes: ["offline_access", "accounting.transactions"],
    fetch: fetchImpl,
    ...overrides,
  });
  const http = new HttpClient(config, new RateLimiter(), noopObserver);
  return new OAuthClient(config, http);
}

describe("generatePkce", () => {
  it("generates a verifier and a matching S256 challenge", async () => {
    const pkce = await generatePkce();
    expect(pkce.verifier.length).toBeGreaterThan(20);
    expect(pkce.challenge.length).toBeGreaterThan(20);
    // challenge should not contain base64 padding or url-unsafe chars
    expect(pkce.challenge).not.toMatch(/[+/=]/);
  });

  it("generates different pairs each time", async () => {
    const a = await generatePkce();
    const b = await generatePkce();
    expect(a.verifier).not.toBe(b.verifier);
  });
});

describe("OAuthClient.authorizeUrl", () => {
  it("includes PKCE parameters", async () => {
    const client = makeOAuthClient(createMockFetch(() => new Response("")));
    const pkce = await generatePkce();
    const url = client.authorizeUrl({ state: "xyz", pkce });
    expect(url).toContain(`code_challenge=${pkce.challenge}`);
    expect(url).toContain("code_challenge_method=S256");
    expect(url).toContain("state=xyz");
  });

  it("throws when no scopes are configured", () => {
    const config = resolveConfig({
      clientId: "id",
      redirectUri: "https://x.com/cb",
      fetch: createMockFetch(() => new Response("")),
    });
    const http = new HttpClient(config, new RateLimiter(), noopObserver);
    const client = new OAuthClient(config, http);
    expect(() => client.authorizeUrl()).toThrow();
  });
});

describe("OAuthClient.exchangeCode", () => {
  it("parses the token response", async () => {
    const fetchImpl = createMockFetch((_url, init) => {
      const body = new URLSearchParams(init.body as string);
      expect(body.get("grant_type")).toBe("authorization_code");
      return jsonResponse({
        access_token: "AT123",
        refresh_token: "RT456",
        token_type: "Bearer",
        expires_in: 1800,
        scope: "offline_access accounting.transactions",
      });
    });
    const client = makeOAuthClient(fetchImpl);

    const token = await client.exchangeCode("some-code", "verifier");
    expect(token.accessToken).toBe("AT123");
    expect(token.refreshToken).toBe("RT456");
    expect(token.scopes).toHaveLength(2);
    expect(token.expiresAt).toBeGreaterThan(Date.now());
  });
});

describe("OAuthClient.refreshToken", () => {
  it("uses the refresh_token grant", async () => {
    const fetchImpl = createMockFetch((_url, init) => {
      const body = new URLSearchParams(init.body as string);
      expect(body.get("grant_type")).toBe("refresh_token");
      expect(body.get("refresh_token")).toBe("old-refresh");
      return jsonResponse({
        access_token: "AT-new",
        refresh_token: "RT-new",
        token_type: "Bearer",
        expires_in: 1800,
      });
    });
    const client = makeOAuthClient(fetchImpl);

    const token = await client.refreshToken("old-refresh");
    expect(token.accessToken).toBe("AT-new");
  });
});

describe("OAuthClient.exchangeCode error handling", () => {
  it("throws an oauth_error on a bad response", async () => {
    const fetchImpl = createMockFetch(() =>
      jsonResponse({ error: "invalid_grant" }, { status: 400 }),
    );
    const client = makeOAuthClient(fetchImpl);

    await expect(client.exchangeCode("bad-code")).rejects.toMatchObject({ type: "oauth_error" });
  });
});

describe("OAuthClient.ensureValid", () => {
  it("returns the token unchanged when it is still fresh", async () => {
    const fetchImpl = createMockFetch(() => {
      throw new Error("token endpoint should not be called for a fresh token");
    });
    const client = makeOAuthClient(fetchImpl);

    const token = {
      accessToken: "still-good",
      refreshToken: "rt",
      tokenType: "Bearer",
      scopes: [],
      obtainedAt: Date.now(),
      expiresAt: Date.now() + 30 * 60_000,
    };
    const result = await client.ensureValid(token, 60_000);
    expect(result.accessToken).toBe("still-good");
  });

  it("refreshes when the token is near expiry", async () => {
    const fetchImpl = createMockFetch(() =>
      jsonResponse({
        access_token: "refreshed",
        refresh_token: "rt2",
        token_type: "Bearer",
        expires_in: 1800,
      }),
    );
    const client = makeOAuthClient(fetchImpl);

    const token = {
      accessToken: "about-to-expire",
      refreshToken: "rt",
      tokenType: "Bearer",
      scopes: [],
      obtainedAt: Date.now(),
      expiresAt: Date.now() + 10_000,
    };
    const result = await client.ensureValid(token, 60_000);
    expect(result.accessToken).toBe("refreshed");
  });
});

describe("OAuthClient.connections", () => {
  it("parses the connections array", async () => {
    const fetchImpl = createMockFetch(() =>
      jsonResponse([
        {
          id: "conn-1",
          tenantId: "tenant-1",
          tenantType: "ORGANISATION",
          tenantName: "Demo Co",
          createdDateUtc: "",
          updatedDateUtc: "",
        },
      ]),
    );
    const client = makeOAuthClient(fetchImpl);

    const conns = await client.connections({
      accessToken: "AT",
      refreshToken: "",
      tokenType: "Bearer",
      scopes: [],
      obtainedAt: 0,
      expiresAt: 0,
    });
    expect(conns).toHaveLength(1);
    expect(conns[0]?.tenantId).toBe("tenant-1");
  });
});
