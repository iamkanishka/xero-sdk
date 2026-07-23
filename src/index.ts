/**
 * xero-sdk — a production-grade, dependency-free TypeScript SDK for
 * the entire Xero API platform.
 *
 * @packageDocumentation
 */

export { XeroClient } from "./XeroClient.js";
export type { XeroConfig, ResolvedXeroConfig } from "./config.js";

// Errors
export {
  XeroError,
  xeroErrorFromResponse,
  type XeroErrorType,
  type XeroErrorDetail,
  type XeroErrorOptions,
  type XeroValidationElement,
  type XeroValidationMessage,
} from "./errors/index.js";

// Auth
export {
  type XeroToken,
  type TokenResponse,
  tokenFromResponse,
  authHeader,
  tokenExpiresWithin,
  tokenIsExpired,
  type XeroConnection,
  type TokenStore,
  MemoryTokenStore,
  FileTokenStore,
  OAuthClient,
  generatePkce,
  type Pkce,
  type AuthorizeUrlOptions,
} from "./auth/index.js";

// HTTP / infra (advanced usage: custom resources, testing, introspection)
export {
  HttpClient,
  parseJson,
  type XeroRequest,
  type XeroResponse,
  RateLimiter,
  DEFAULT_DAY_LIMIT,
  DEFAULT_MIN_LIMIT,
  type RateLimiterOptions,
  type RateLimitState,
  buildHeaders,
  getJson,
  sendJson,
  requestRaw,
  requireValue,
  type RequestOptions,
} from "./http/index.js";

// Telemetry
export {
  noopObserver,
  type XeroObserver,
  type RequestEvent,
  type RateLimitEvent,
} from "./telemetry/index.js";

// Pagination
export {
  paginate,
  collectAll,
  forEachPage,
  PAGE_SIZE,
  type FetchPageFn,
} from "./pagination/index.js";

// Date utilities
export { parseXeroDate, formatXeroDate, formatXeroMsDate } from "./dates.js";

// Domain resources (types + resource classes, for advanced/direct usage or custom composition)
export { AccountingClient } from "./resources/accounting/index.js";
export * from "./resources/accounting/types.js";
export type { ListParams as AccountingListParams } from "./resources/accounting/base.js";
export type { JournalParams } from "./resources/accounting/journals.js";
export type { ReportParams } from "./resources/accounting/reports.js";
export { ATTACHABLE_RESOURCE_TYPES } from "./resources/accounting/attachments.js";

export { AssetsClient } from "./resources/assets/index.js";
export type {
  ListParams as AssetsListParams,
  XeroObject as AssetsObject,
} from "./resources/assets/index.js";

export { FilesClient } from "./resources/files/index.js";
export type {
  ListParams as FilesListParams,
  XeroObject as FilesObject,
} from "./resources/files/index.js";

export { ProjectsClient } from "./resources/projects/index.js";
export type {
  ListParams as ProjectsListParams,
  XeroObject as ProjectsObject,
} from "./resources/projects/index.js";

export { BankFeedsClient } from "./resources/bankfeeds/index.js";
export type {
  ListParams as BankFeedsListParams,
  XeroObject as BankFeedsObject,
} from "./resources/bankfeeds/index.js";

export { FinanceClient } from "./resources/finance/index.js";
export type {
  BankStatementsParams,
  CashValidationParams,
  StatementParams,
  MonthRangeParams,
  XeroObject as FinanceObject,
} from "./resources/finance/index.js";

export { PracticeManagerClient } from "./resources/practicemanager/index.js";

export { AppStoreClient } from "./resources/appstore/index.js";
export type {
  ListParams as AppStoreListParams,
  XeroObject as AppStoreObject,
} from "./resources/appstore/index.js";

export { EInvoicingClient } from "./resources/einvoicing/index.js";
export type {
  DocumentListParams,
  XeroObject as EInvoicingObject,
} from "./resources/einvoicing/index.js";

export { PayrollAuClient, PayrollNzClient, PayrollUkClient } from "./resources/payroll/index.js";
export type {
  ListParams as PayrollListParams,
  XeroObject as PayrollObject,
} from "./resources/payroll/index.js";
