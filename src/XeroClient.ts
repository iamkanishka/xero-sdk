import { resolveConfig, type XeroConfig, type ResolvedXeroConfig } from "./config.js";
import { HttpClient } from "./http/HttpClient.js";
import { RateLimiter, type RateLimitState } from "./http/RateLimiter.js";
import { OAuthClient } from "./auth/OAuthClient.js";
import { MemoryTokenStore, type TokenStore } from "./auth/TokenStore.js";
import type { XeroToken } from "./auth/Token.js";
import { noopObserver, type XeroObserver } from "./telemetry/index.js";
import { XeroError } from "./errors/index.js";

import { AccountingClient } from "./resources/accounting/index.js";
import { AssetsClient } from "./resources/assets/index.js";
import { FilesClient } from "./resources/files/index.js";
import { ProjectsClient } from "./resources/projects/index.js";
import { BankFeedsClient } from "./resources/bankfeeds/index.js";
import { FinanceClient } from "./resources/finance/index.js";
import { PracticeManagerClient } from "./resources/practicemanager/index.js";
import { AppStoreClient } from "./resources/appstore/index.js";
import { EInvoicingClient } from "./resources/einvoicing/index.js";
import { PayrollAuClient, PayrollNzClient, PayrollUkClient } from "./resources/payroll/index.js";

/**
 * The SDK's single entry point, wiring together shared infrastructure
 * — OAuth 2.0, a retrying/rate-limited HTTP transport, and telemetry —
 * and exposing one property per domain (`accounting`, `assets`,
 * `payrollAu`, ...), each a thin, typed client for that API.
 *
 * @example
 * ```ts
 * const client = new XeroClient({
 *   clientId: process.env.XERO_CLIENT_ID!,
 *   clientSecret: process.env.XERO_CLIENT_SECRET,
 *   redirectUri: "https://myapp.example.com/callback",
 *   scopes: ["offline_access", "accounting.transactions", "accounting.contacts"],
 * });
 *
 * const pkce = await generatePkce();
 * const authUrl = client.auth.authorizeUrl({ state: "xyz", pkce });
 * // ... redirect the user, receive the callback with ?code=... ...
 * const token = await client.auth.exchangeCode(code, pkce.verifier);
 * const [connection] = await client.auth.connections(token);
 * const invoices = await client.accounting.invoices.list(token, connection.tenantId);
 * ```
 */
export class XeroClient {
  private readonly config: ResolvedXeroConfig;
  private readonly http: HttpClient;
  private readonly limiter: RateLimiter;
  private readonly store: TokenStore;
  private readonly observer: XeroObserver;

  readonly auth: OAuthClient;
  readonly accounting: AccountingClient;
  readonly assets: AssetsClient;
  readonly files: FilesClient;
  readonly projects: ProjectsClient;
  readonly bankFeeds: BankFeedsClient;
  readonly finance: FinanceClient;
  readonly practiceManager: PracticeManagerClient;
  readonly appStore: AppStoreClient;
  readonly eInvoicing: EInvoicingClient;
  readonly payrollAu: PayrollAuClient;
  readonly payrollNz: PayrollNzClient;
  readonly payrollUk: PayrollUkClient;

  constructor(config: XeroConfig) {
    this.config = resolveConfig(config);
    this.store = config.store ?? new MemoryTokenStore();
    this.observer = config.observer ?? noopObserver;

    this.limiter = new RateLimiter();
    this.http = new HttpClient(this.config, this.limiter, this.observer);
    this.auth = new OAuthClient(this.config, this.http);

    this.accounting = new AccountingClient(this.http, this.config.accountingBaseUrl);
    this.assets = new AssetsClient(this.http, this.config.assetsBaseUrl);
    this.files = new FilesClient(this.http, this.config.filesBaseUrl);
    this.projects = new ProjectsClient(this.http, this.config.projectsBaseUrl);
    this.bankFeeds = new BankFeedsClient(this.http, this.config.bankFeedsBaseUrl);
    this.finance = new FinanceClient(this.http, this.config.financeBaseUrl);
    this.practiceManager = new PracticeManagerClient(this.http, this.config.practiceManagerBaseUrl);
    this.appStore = new AppStoreClient(this.http, this.config.appStoreBaseUrl);
    this.eInvoicing = new EInvoicingClient(this.http, this.config.eInvoicingBaseUrl);
    this.payrollAu = new PayrollAuClient(this.http, this.config.payrollAuBaseUrl);
    this.payrollNz = new PayrollNzClient(this.http, this.config.payrollNzBaseUrl);
    this.payrollUk = new PayrollUkClient(this.http, this.config.payrollUkBaseUrl);
  }

  /** The configured {@link TokenStore}. */
  getStore(): TokenStore {
    return this.store;
  }

  /** The shared per-tenant rate limiter — e.g. to inspect remaining quota via `rateLimiterState(tenantId)`. */
  rateLimiterState(tenantId: string): RateLimitState {
    return this.limiter.state(tenantId);
  }

  /**
   * Returns `token` unchanged if it has more than `skewMs` left before
   * expiry; otherwise refreshes it and returns the new token. Does not
   * consult or update the store — see {@link tokenFor} for the
   * store-integrated flow.
   */
  ensureValidToken(token: XeroToken, skewMs = 120_000, signal?: AbortSignal): Promise<XeroToken> {
    return this.auth.ensureValid(token, skewMs, signal);
  }

  /**
   * Loads the token stored under `key`, refreshing and re-persisting
   * it first if it's within 2 minutes of expiring. This is the
   * recommended way to obtain a token to pass into any domain resource
   * call in a long-running server process.
   */
  async tokenFor(key: string, signal?: AbortSignal): Promise<XeroToken> {
    const token = await this.store.get(key);
    if (!token) {
      throw XeroError.configError(`no token stored for key "${key}"`);
    }
    let refreshed: XeroToken;
    try {
      refreshed = await this.auth.ensureValid(token, 120_000, signal);
    } catch (err) {
      this.observer.onTokenRefreshFailed(key, err);
      throw err;
    }
    if (refreshed.accessToken !== token.accessToken) {
      await this.store.put(key, refreshed);
      this.observer.onTokenRefreshed(key);
    }
    return refreshed;
  }

  /** Persists `token` under `key` in the configured store. */
  saveToken(key: string, token: XeroToken): Promise<void> {
    return this.store.put(key, token);
  }
}
