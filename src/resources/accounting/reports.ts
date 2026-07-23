import { AccountingResourceBase, first } from "./base.js";
import type { Report } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

/**
 * Query options accepted by report endpoints. Which fields apply
 * depends on the specific report; unused ones are simply omitted from
 * the query string.
 */
export interface ReportParams {
  /** YYYY-MM-DD, for single point-in-time reports (Balance Sheet, Trial Balance). */
  date?: string;
  /** For period reports (P&L, aged reports). */
  fromDate?: string;
  toDate?: string;
  periodsCount?: number;
  /** MONTH | YEAR */
  periodsType?: string;
  trackingCategoryId?: string;
  trackingCategoryId2?: string;
  trackingOptionId?: string;
  trackingOptionId2?: string;
  standardLayout?: boolean;
  paymentsOnly?: boolean;
  /** MONTH | QUARTER | YEAR (Budget Summary). */
  timeframe?: string;
  /** Aged Receivables/Payables by contact. */
  contactId?: string;
}

function toQuery(params: ReportParams): URLSearchParams {
  const q = new URLSearchParams();
  const set = (key: string, value: string | undefined): void => {
    if (value) q.set(key, value);
  };
  set("date", params.date);
  set("fromDate", params.fromDate);
  set("toDate", params.toDate);
  if (params.periodsCount) q.set("periods", String(params.periodsCount));
  set("timeframe", (params.periodsType ?? params.timeframe)?.toUpperCase());
  set("trackingCategoryID", params.trackingCategoryId);
  set("trackingCategoryID2", params.trackingCategoryId2);
  set("trackingOptionID", params.trackingOptionId);
  set("trackingOptionID2", params.trackingOptionId2);
  if (params.standardLayout) q.set("standardLayout", "true");
  if (params.paymentsOnly) q.set("paymentsOnly", "true");
  set("contactID", params.contactId);
  return q;
}

/** Every report endpoint in the Accounting API. */
export class ReportsResource extends AccountingResourceBase {
  private async fetchReport(
    token: XeroToken,
    tenantId: string,
    path: string,
    params: ReportParams,
    signal?: AbortSignal,
  ): Promise<Report> {
    const query = toQuery(params);
    const url = `${this.baseUrl}${path}${query.toString() ? `?${query.toString()}` : ""}`;
    const env = await this.httpGetRaw<{ Reports: Report[] }>(
      token,
      tenantId,
      url,
      `/Reports${path}`,
      signal,
    );
    return first(env.Reports);
  }

  balanceSheet(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/BalanceSheet", params, signal);
  }

  profitAndLoss(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/ProfitAndLoss", params, signal);
  }

  trialBalance(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/TrialBalance", params, signal);
  }

  agedReceivablesByContact(
    token: XeroToken,
    tenantId: string,
    params: ReportParams,
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/AgedReceivablesByContact", params, signal);
  }

  agedPayablesByContact(
    token: XeroToken,
    tenantId: string,
    params: ReportParams,
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/AgedPayablesByContact", params, signal);
  }

  bankSummary(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/BankSummary", params, signal);
  }

  budgetSummary(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/BudgetSummary", params, signal);
  }

  executiveSummary(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/ExecutiveSummary", params, signal);
  }

  /** US 1099 report. */
  tenNinetyNine(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, "/Reports/TenNinetyNine", params, signal);
  }

  /** Lists Australian BAS (Business Activity Statement) reports available for the organisation. */
  async listBas(token: XeroToken, tenantId: string, signal?: AbortSignal): Promise<Report[]> {
    const url = `${this.baseUrl}/Reports/BAS`;
    const env = await this.httpGetRaw<{ Reports: Report[] }>(
      token,
      tenantId,
      url,
      "/Reports/BAS",
      signal,
    );
    return env.Reports;
  }

  getBas(token: XeroToken, tenantId: string, basId: string, signal?: AbortSignal): Promise<Report> {
    return this.fetchReport(token, tenantId, `/Reports/BAS/${basId}`, {}, signal);
  }

  /** Lists New Zealand GST reports available for the organisation. */
  async listGst(
    token: XeroToken,
    tenantId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report[]> {
    const query = toQuery(params);
    const url = `${this.baseUrl}/Reports/GST${query.toString() ? `?${query.toString()}` : ""}`;
    const env = await this.httpGetRaw<{ Reports: Report[] }>(
      token,
      tenantId,
      url,
      "/Reports/GST",
      signal,
    );
    return env.Reports;
  }

  getGst(
    token: XeroToken,
    tenantId: string,
    reportId: string,
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, `/Reports/GST/${reportId}`, {}, signal);
  }

  /** Lists reports available for the organisation (some reports, like BAS/GST, are only listed here since they're identified by a generated ReportID). */
  async list(token: XeroToken, tenantId: string, signal?: AbortSignal): Promise<Report[]> {
    const url = `${this.baseUrl}/Reports`;
    const env = await this.httpGetRaw<{ Reports: Report[] }>(
      token,
      tenantId,
      url,
      "/Reports",
      signal,
    );
    return env.Reports;
  }

  getById(
    token: XeroToken,
    tenantId: string,
    reportId: string,
    params: ReportParams = {},
    signal?: AbortSignal,
  ): Promise<Report> {
    return this.fetchReport(token, tenantId, this.idPath("Reports", reportId), params, signal);
  }
}
