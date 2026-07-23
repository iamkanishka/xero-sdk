/**
 * Represents a Xero OAuth 2.0 access/refresh token pair bound to the
 * user who authorized the connection. A single token can be used
 * against any tenant (organisation) the user granted access to — the
 * tenant is selected per-request via the `Xero-Tenant-Id` header, not
 * encoded in the token.
 */
export interface XeroToken {
  accessToken: string;
  refreshToken: string;
  /** Almost always "Bearer". */
  tokenType: string;
  idToken?: string;
  scopes: string[];
  /** Milliseconds since epoch. */
  expiresAt: number;
  /** Milliseconds since epoch. */
  obtainedAt: number;
}

/** Raw JSON body returned by Xero's `/connect/token` endpoint. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  id_token?: string;
  expires_in?: number;
  scope?: string;
}

/** Converts a raw token endpoint response into a {@link XeroToken}. */
export function tokenFromResponse(r: TokenResponse): XeroToken {
  const now = Date.now();
  const expiresIn = r.expires_in && r.expires_in > 0 ? r.expires_in : 1800;
  return {
    accessToken: r.access_token,
    refreshToken: r.refresh_token,
    tokenType: r.token_type ?? "Bearer",
    idToken: r.id_token,
    scopes: r.scope ? r.scope.split(/\s+/).filter(Boolean) : [],
    obtainedAt: now,
    expiresAt: now + expiresIn * 1000,
  };
}

/** Value for the `Authorization` HTTP header. */
export function authHeader(token: XeroToken): string {
  return `${token.tokenType} ${token.accessToken}`;
}

/**
 * Reports whether `token` will be expired within `skewMs` — used to
 * proactively refresh slightly before server-side expiry, avoiding a
 * race between an in-flight request and expiry.
 */
export function tokenExpiresWithin(token: XeroToken, skewMs: number): boolean {
  if (!token.expiresAt) return true;
  return Date.now() + skewMs >= token.expiresAt;
}

export function tokenIsExpired(token: XeroToken): boolean {
  return tokenExpiresWithin(token, 0);
}

/** One entry from `GET /connections` — a tenant this token can access. */
export interface XeroConnection {
  id: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}
