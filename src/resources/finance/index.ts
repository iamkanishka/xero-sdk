import type { HttpClient } from "../../http/HttpClient.js";
import { getJson, type RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

export type XeroObject = Record<string, unknown>;

function setStr(q: URLSearchParams, key: string, val?: string): void {
  if (val) q.set(key, val);
}
function setBool(q: URLSearchParams, key: string, val?: boolean): void {
  if (val !== undefined) q.set(key, val ? "true" : "false");
}

export interface BankStatementsParams {
  bankAccountId: string;
  fromDate?: string;
  toDate?: string;
  summaryOnly?: boolean;
}

export interface CashValidationParams {
  balanceDate?: string;
  beginDate?: string;
  includeCreditTransactions?: boolean;
}

export interface StatementParams {
  balanceDate?: string;
  fromDate?: string;
  toDate?: string;
  periods?: number;
  /** MONTH | QUARTER | YEAR */
  timeframe?: string;
  trackingCategoryId?: string;
  trackingOptionId?: string;
  standardLayout?: boolean;
  paymentsOnly?: boolean;
}

export interface MonthRangeParams {
  /** YYYY-MM */
  startMonth?: string;
  /** YYYY-MM */
  endMonth?: string;
}

/**
 * Finance API (finance.xro/1.0): bank statements, cash validation,
 * financial statements (balance sheet, P&L, trial balance, cash flow),
 * and accounting-activity audit reports. Read-only; used for
 * lending/risk assessment integrations.
 */
export class FinanceClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  private get(
    token: XeroToken,
    tenantId: string,
    path: string,
    q: URLSearchParams,
    options: RequestOptions,
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, path, token, q, { ...options, tenantId });
  }

  /** Statement-line-level bank statement data for a bank account, cross-referenced against Xero's reconciled balance. */
  bankStatements(
    token: XeroToken,
    tenantId: string,
    params: BankStatementsParams,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    const q = new URLSearchParams();
    setStr(q, "bankAccountID", params.bankAccountId);
    setStr(q, "fromDate", params.fromDate);
    setStr(q, "toDate", params.toDate);
    setBool(q, "summaryOnly", params.summaryOnly);
    return this.get(token, tenantId, "/BankStatementsPlus/statements", q, options);
  }

  /** Identifies discrepancies between Xero's account balances and actual bank statement balances. */
  cashValidation(
    token: XeroToken,
    tenantId: string,
    params: CashValidationParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    const q = new URLSearchParams();
    setStr(q, "balanceDate", params.balanceDate);
    setStr(q, "beginDate", params.beginDate);
    setBool(q, "includeCreditTransactions", params.includeCreditTransactions);
    return this.get(token, tenantId, "/CashValidation", q, options);
  }

  private statementQuery(params: StatementParams): URLSearchParams {
    const q = new URLSearchParams();
    setStr(q, "balanceDate", params.balanceDate);
    setStr(q, "fromDate", params.fromDate);
    setStr(q, "toDate", params.toDate);
    setStr(q, "timeframe", params.timeframe);
    setStr(q, "trackingCategoryID", params.trackingCategoryId);
    setStr(q, "trackingOptionID", params.trackingOptionId);
    if (params.periods) q.set("periods", String(params.periods));
    setBool(q, "standardLayout", params.standardLayout);
    setBool(q, "paymentsOnly", params.paymentsOnly);
    return q;
  }

  balanceSheet(
    token: XeroToken,
    tenantId: string,
    params: StatementParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.get(
      token,
      tenantId,
      "/FinancialStatements/balanceSheet",
      this.statementQuery(params),
      options,
    );
  }

  profitAndLoss(
    token: XeroToken,
    tenantId: string,
    params: StatementParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.get(
      token,
      tenantId,
      "/FinancialStatements/profitAndLoss",
      this.statementQuery(params),
      options,
    );
  }

  trialBalance(
    token: XeroToken,
    tenantId: string,
    params: StatementParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.get(
      token,
      tenantId,
      "/FinancialStatements/trialBalance",
      this.statementQuery(params),
      options,
    );
  }

  cashFlow(
    token: XeroToken,
    tenantId: string,
    params: StatementParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.get(
      token,
      tenantId,
      "/FinancialStatements/cashflow",
      this.statementQuery(params),
      options,
    );
  }

  private monthRangeQuery(params: MonthRangeParams): URLSearchParams {
    const q = new URLSearchParams();
    setStr(q, "startMonth", params.startMonth);
    setStr(q, "endMonth", params.endMonth);
    return q;
  }

  /** Lock-history activity (period lock/unlock events). */
  accountingActivity(
    token: XeroToken,
    tenantId: string,
    params: MonthRangeParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.get(
      token,
      tenantId,
      "/AccountingActivities/lockHistory",
      this.monthRangeQuery(params),
      options,
    );
  }

  /** Report-run activity statistics. */
  reportActivity(
    token: XeroToken,
    tenantId: string,
    params: MonthRangeParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.get(
      token,
      tenantId,
      "/AccountingActivities/reportActivity",
      this.monthRangeQuery(params),
      options,
    );
  }

  /** User activity statistics for a given month (YYYY-MM). */
  userActivities(
    token: XeroToken,
    tenantId: string,
    dataMonth: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    const q = new URLSearchParams({ dataMonth });
    return this.get(token, tenantId, "/AccountingActivities/userActivities", q, options);
  }

  /** Summarized accounting activity overview. */
  accountingActivityOverview(
    token: XeroToken,
    tenantId: string,
    params: MonthRangeParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.get(
      token,
      tenantId,
      "/AccountingActivities",
      this.monthRangeQuery(params),
      options,
    );
  }
}
