import type { ResolvedXeroConfig } from "../config.js";
import type { HttpClient } from "../http/HttpClient.js";
import { buildHeaders } from "../http/helpers.js";
import { XeroError } from "../errors/index.js";
import type { XeroToken, TokenResponse, XeroConnection } from "./Token.js";
import { tokenFromResponse, tokenExpiresWithin } from "./Token.js";

/** A generated PKCE `code_verifier`/`code_challenge` pair. */
export interface Pkce {
  verifier: string;
  challenge: string;
}

/** Generates a cryptographically random S256 PKCE pair via Web Crypto. */
export async function generatePkce(): Promise<Pkce> {
  const crypto = getWebCrypto();
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = base64UrlEncode(verifierBytes);

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(digest));

  return { verifier, challenge };
}

export interface AuthorizeUrlOptions {
  state?: string;
  /** Overrides `config.scopes` if provided. */
  scopes?: string[];
  /** Set to enable PKCE (recommended; required for public clients with no client secret). */
  pkce?: Pkce;
  /** e.g. "consent" or "login". */
  prompt?: string;
}

/**
 * Drives Xero's OAuth 2.0 flows: Authorization Code (+ PKCE) for
 * standard/custom connections, Client Credentials for App Store
 * partner APIs, token refresh, revocation, and the `/connections`
 * endpoint used to discover which tenants a token can access.
 */
export class OAuthClient {
  constructor(
    private readonly config: ResolvedXeroConfig,
    private readonly http: HttpClient,
  ) {}

  /** Builds the URL to redirect the user's browser to, to begin the Authorization Code flow. */
  authorizeUrl(options: AuthorizeUrlOptions = {}): string {
    if (!this.config.redirectUri) {
      throw XeroError.configError("`redirectUri` is required to build an authorize URL");
    }
    const scopes = options.scopes?.length ? options.scopes : this.config.scopes;
    if (!scopes.length) {
      throw XeroError.configError("at least one scope is required");
    }

    const q = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(" "),
    });
    if (options.state) q.set("state", options.state);
    if (options.prompt) q.set("prompt", options.prompt);
    if (options.pkce) {
      q.set("code_challenge", options.pkce.challenge);
      q.set("code_challenge_method", "S256");
    }
    return `${this.config.authorizeUrl}?${q.toString()}`;
  }

  /**
   * Swaps an authorization code (received on your redirect URI) for a
   * token. `verifier` is the PKCE `code_verifier` if PKCE was used
   * when building the authorize URL; omit otherwise.
   */
  async exchangeCode(code: string, verifier?: string, signal?: AbortSignal): Promise<XeroToken> {
    const form = new URLSearchParams({ grant_type: "authorization_code", code });
    if (this.config.redirectUri) form.set("redirect_uri", this.config.redirectUri);
    if (verifier) form.set("code_verifier", verifier);
    return this.postToken(form, signal);
  }

  /**
   * Exchanges a refresh token for a new token pair. Xero rotates
   * refresh tokens on every use — always persist the new
   * `refreshToken` returned here.
   */
  async refreshToken(refreshToken: string, signal?: AbortSignal): Promise<XeroToken> {
    const form = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken });
    return this.postToken(form, signal);
  }

  /** Obtains a token via the Client Credentials grant (App Store partner API — no user/tenant context). */
  async clientCredentialsToken(scopes: string[] = [], signal?: AbortSignal): Promise<XeroToken> {
    const form = new URLSearchParams({ grant_type: "client_credentials" });
    if (scopes.length) form.set("scope", scopes.join(" "));
    return this.postToken(form, signal);
  }

  /** Invalidates a refresh token (and its associated access tokens) server-side. */
  async revokeToken(refreshToken: string, signal?: AbortSignal): Promise<void> {
    await this.postForm(
      this.config.revokeUrl,
      new URLSearchParams({ token: refreshToken }),
      signal,
    );
  }

  /** Returns the tenants (organisations/practices) `token` is authorized to access. */
  async connections(token: XeroToken, signal?: AbortSignal): Promise<XeroConnection[]> {
    const response = await this.http.request({
      method: "GET",
      url: this.config.connectionsUrl,
      logicalPath: "/connections",
      headers: buildHeaders(token),
      skipRateLimit: true,
      signal,
    });
    return JSON.parse(response.bodyText) as XeroConnection[];
  }

  /** Revokes this app's access to a single tenant (without revoking the whole token). */
  async disconnectTenant(
    token: XeroToken,
    connectionId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.http.request({
      method: "DELETE",
      url: `${this.config.connectionsUrl}/${connectionId}`,
      logicalPath: "/connections/{id}",
      headers: buildHeaders(token),
      skipRateLimit: true,
      signal,
    });
  }

  /**
   * Returns `token` unchanged if it has more than `skewMs` left before
   * expiry; otherwise refreshes it and returns the new token.
   */
  async ensureValid(token: XeroToken, skewMs: number, signal?: AbortSignal): Promise<XeroToken> {
    if (!tokenExpiresWithin(token, skewMs)) return token;
    if (!token.refreshToken) {
      throw XeroError.configError("token is expired and has no refreshToken to renew it");
    }
    return this.refreshToken(token.refreshToken, signal);
  }

  private async postToken(form: URLSearchParams, signal?: AbortSignal): Promise<XeroToken> {
    const response = await this.postForm(this.config.tokenUrl, form, signal);
    let parsed: TokenResponse;
    try {
      parsed = JSON.parse(response.bodyText) as TokenResponse;
    } catch (err) {
      throw XeroError.configError(`failed to decode token response: ${String(err)}`);
    }
    if (!parsed.access_token) {
      throw XeroError.oauthError(response.status, response.bodyText);
    }
    return tokenFromResponse(parsed);
  }

  private async postForm(
    url: string,
    form: URLSearchParams,
    signal?: AbortSignal,
  ): Promise<{ status: number; bodyText: string }> {
    if (!this.config.clientId) throw XeroError.configError("`clientId` is required");

    const headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    });
    if (this.config.clientSecret) {
      headers.set("Authorization", basicAuth(this.config.clientId, this.config.clientSecret));
    } else {
      form.set("client_id", this.config.clientId);
    }

    try {
      const response = await this.http.request({
        method: "POST",
        url,
        logicalPath: logicalPathFor(url),
        headers,
        body: form.toString(),
        skipRateLimit: true,
        signal,
      });
      return { status: response.status, bodyText: response.bodyText };
    } catch (err) {
      if (err instanceof XeroError && err.status !== undefined) {
        throw new XeroError("oauth_error", "oauth request failed", {
          status: err.status,
          raw: err.raw,
        });
      }
      throw err;
    }
  }
}

function basicAuth(id: string, secret: string): string {
  const encoded =
    typeof btoa === "function"
      ? btoa(`${id}:${secret}`)
      : Buffer.from(`${id}:${secret}`, "utf8").toString("base64");
  return `Basic ${encoded}`;
}

function logicalPathFor(url: string): string {
  if (url.includes("/token")) return "/connect/token";
  if (url.includes("/revoke")) return "/connect/revoke";
  return "/oauth";
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getWebCrypto(): Crypto {
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto?.subtle) return g.crypto;
  throw XeroError.configError(
    "xero-sdk: no Web Crypto API available (globalThis.crypto.subtle). Use Node.js >= 19 or a browser.",
  );
}
