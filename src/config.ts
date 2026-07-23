import type { XeroObserver } from "./telemetry/index.js";
import type { TokenStore } from "./auth/TokenStore.js";

export const DEFAULT_AUTHORIZE_URL = "https://login.xero.com/identity/connect/authorize";
export const DEFAULT_TOKEN_URL = "https://identity.xero.com/connect/token"; // public endpoint, not a credential
export const DEFAULT_REVOKE_URL = "https://identity.xero.com/connect/revoke";
export const DEFAULT_CONNECTIONS_URL = "https://api.xero.com/connections";

export const DEFAULT_ACCOUNTING_BASE_URL = "https://api.xero.com/api.xro/2.0";
export const DEFAULT_ASSETS_BASE_URL = "https://api.xero.com/assets.xro/1.0";
export const DEFAULT_FILES_BASE_URL = "https://api.xero.com/files.xro/1.0";
export const DEFAULT_PROJECTS_BASE_URL = "https://api.xero.com/projects.xro/2.0";
export const DEFAULT_BANKFEEDS_BASE_URL = "https://api.xero.com/bankfeeds.xro/1.0";
export const DEFAULT_FINANCE_BASE_URL = "https://api.xero.com/finance.xro/1.0";
export const DEFAULT_PRACTICE_MANAGER_BASE_URL = "https://api.xero.com/practicemanager/3.1";
export const DEFAULT_APPSTORE_BASE_URL = "https://api.xero.com/appstore/2.0";
export const DEFAULT_EINVOICING_BASE_URL = "https://api.xero.com/einvoicing.xro/1.0";
export const DEFAULT_PAYROLL_AU_BASE_URL = "https://api.xero.com/payroll.xro/2.0";
export const DEFAULT_PAYROLL_NZ_BASE_URL = "https://api.xero.com/payroll.xro/2.0";
export const DEFAULT_PAYROLL_UK_BASE_URL = "https://api.xero.com/payroll.xro/2.0";

export const DEFAULT_USER_AGENT = "xero-sdk/1.0 (+https://github.com/iamkanishka/xero-sdk)";

/** Every configurable knob for a {@link XeroClient}. */
export interface XeroConfig {
  /** OAuth 2.0 app credentials, from the Xero Developer Portal. */
  clientId: string;
  /** Empty/omitted for PKCE-only public clients (SPAs, CLIs, mobile). */
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];

  // Endpoint overrides — rarely needed outside of testing against a mock server.
  authorizeUrl?: string;
  tokenUrl?: string;
  revokeUrl?: string;
  connectionsUrl?: string;
  accountingBaseUrl?: string;
  assetsBaseUrl?: string;
  filesBaseUrl?: string;
  projectsBaseUrl?: string;
  bankFeedsBaseUrl?: string;
  financeBaseUrl?: string;
  practiceManagerBaseUrl?: string;
  appStoreBaseUrl?: string;
  eInvoicingBaseUrl?: string;
  payrollAuBaseUrl?: string;
  payrollNzBaseUrl?: string;
  payrollUkBaseUrl?: string;

  /** Custom fetch implementation (proxies, testing, non-global fetch runtimes). */
  fetch?: typeof fetch;
  /** Per-attempt timeout in milliseconds. Default 30_000. */
  requestTimeoutMs?: number;
  /** Retries on 429/5xx/network errors. Default 3. */
  maxRetries?: number;
  /** Base delay for exponential backoff, in milliseconds. Default 250. */
  retryBaseDelayMs?: number;
  /** Max backoff delay, in milliseconds. Default 10_000. */
  retryMaxDelayMs?: number;
  userAgent?: string;

  /** Disable client-side rate limiting entirely (not recommended against production tenants). */
  disableRateLimit?: boolean;

  /** Token persistence. Defaults to an in-memory store. */
  store?: TokenStore;
  /** Telemetry sink. Defaults to a no-op. */
  observer?: XeroObserver;
}

/** {@link XeroConfig} with every optional field filled from defaults. */
export type ResolvedXeroConfig = Required<
  Omit<XeroConfig, "clientSecret" | "redirectUri" | "store" | "observer">
> &
  Pick<XeroConfig, "clientSecret" | "redirectUri" | "store" | "observer">;

export function resolveConfig(config: XeroConfig): ResolvedXeroConfig {
  if (!config.clientId) {
    throw new Error("xero-sdk: `clientId` is required");
  }
  const fetchImpl = config.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new Error(
      "xero-sdk: no global `fetch` found. Provide one via `config.fetch` (Node < 18, or a custom runtime).",
    );
  }

  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    scopes: config.scopes ?? [],

    authorizeUrl: config.authorizeUrl ?? DEFAULT_AUTHORIZE_URL,
    tokenUrl: config.tokenUrl ?? DEFAULT_TOKEN_URL,
    revokeUrl: config.revokeUrl ?? DEFAULT_REVOKE_URL,
    connectionsUrl: config.connectionsUrl ?? DEFAULT_CONNECTIONS_URL,
    accountingBaseUrl: config.accountingBaseUrl ?? DEFAULT_ACCOUNTING_BASE_URL,
    assetsBaseUrl: config.assetsBaseUrl ?? DEFAULT_ASSETS_BASE_URL,
    filesBaseUrl: config.filesBaseUrl ?? DEFAULT_FILES_BASE_URL,
    projectsBaseUrl: config.projectsBaseUrl ?? DEFAULT_PROJECTS_BASE_URL,
    bankFeedsBaseUrl: config.bankFeedsBaseUrl ?? DEFAULT_BANKFEEDS_BASE_URL,
    financeBaseUrl: config.financeBaseUrl ?? DEFAULT_FINANCE_BASE_URL,
    practiceManagerBaseUrl: config.practiceManagerBaseUrl ?? DEFAULT_PRACTICE_MANAGER_BASE_URL,
    appStoreBaseUrl: config.appStoreBaseUrl ?? DEFAULT_APPSTORE_BASE_URL,
    eInvoicingBaseUrl: config.eInvoicingBaseUrl ?? DEFAULT_EINVOICING_BASE_URL,
    payrollAuBaseUrl: config.payrollAuBaseUrl ?? DEFAULT_PAYROLL_AU_BASE_URL,
    payrollNzBaseUrl: config.payrollNzBaseUrl ?? DEFAULT_PAYROLL_NZ_BASE_URL,
    payrollUkBaseUrl: config.payrollUkBaseUrl ?? DEFAULT_PAYROLL_UK_BASE_URL,

    fetch: fetchImpl,
    requestTimeoutMs: config.requestTimeoutMs ?? 30_000,
    maxRetries: config.maxRetries ?? 3,
    retryBaseDelayMs: config.retryBaseDelayMs ?? 250,
    retryMaxDelayMs: config.retryMaxDelayMs ?? 10_000,
    userAgent: config.userAgent ?? DEFAULT_USER_AGENT,
    disableRateLimit: config.disableRateLimit ?? false,

    store: config.store,
    observer: config.observer,
  };
}
