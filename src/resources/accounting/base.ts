import type { HttpClient } from "../../http/HttpClient.js";
import type { XeroResponse } from "../../http/HttpClient.js";
import { buildHeaders, parseJson } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";
import { XeroError } from "../../errors/index.js";

/** Query options accepted by nearly every list endpoint in the Accounting API. */
export interface ListParams {
  /** Xero "where" filter expression, e.g. `Status=="AUTHORISED"`. */
  where?: string;
  /** e.g. "Name ASC". */
  order?: string;
  /** 1-indexed; each page is 100 items. */
  page?: number;
  /** Only honored by endpoints that support it (Invoices, CreditNotes). */
  pageSize?: number;
  ids?: string[];
  /** RFC1123/RFC3339 timestamp; server-side `If-Modified-Since` filter. */
  ifModifiedSince?: string;
  /** Return lightweight summary fields only (Invoices, Contacts, etc.). */
  summaryOnly?: boolean;
}

export function listParamsToQuery(params: ListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.where) q.set("where", params.where);
  if (params.order) q.set("order", params.order);
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.ids?.length) q.set("IDs", params.ids.join(","));
  if (params.summaryOnly) q.set("summaryOnly", "true");
  return q;
}

/** Base class shared by every Accounting sub-resource (Accounts, Contacts, Invoices, ...). */
export abstract class AccountingResourceBase {
  constructor(
    protected readonly http: HttpClient,
    protected readonly baseUrl: string,
  ) {}

  protected headers(token: XeroToken, ifModifiedSince?: string): Headers {
    const h = buildHeaders(token, "application/json");
    if (ifModifiedSince) h.set("If-Modified-Since", ifModifiedSince);
    return h;
  }

  protected async httpGet<T>(
    token: XeroToken,
    tenantId: string,
    path: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<T> {
    const query = listParamsToQuery(params);
    const url = query.toString()
      ? `${this.baseUrl}${path}?${query.toString()}`
      : `${this.baseUrl}${path}`;
    const response = await this.http.request({
      method: "GET",
      url,
      logicalPath: path,
      headers: this.headers(token, params.ifModifiedSince),
      tenantId,
      signal,
    });
    return parseJson<T>(response) as T;
  }

  /** GET against a pre-built absolute URL (used by Reports, which assembles its own query string). */
  protected async httpGetRaw<T>(
    token: XeroToken,
    tenantId: string,
    url: string,
    logicalPath: string,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.http.request({
      method: "GET",
      url,
      logicalPath,
      headers: this.headers(token),
      tenantId,
      signal,
    });
    return parseJson<T>(response) as T;
  }

  protected async httpSend<T>(
    token: XeroToken,
    tenantId: string,
    method: string,
    path: string,
    body: unknown,
    options: { idempotencyKey?: string; signal?: AbortSignal } = {},
  ): Promise<T> {
    const headers = this.headers(token);
    const response = await this.http.request({
      method,
      url: `${this.baseUrl}${path}`,
      logicalPath: path,
      headers,
      body: body !== undefined ? JSON.stringify(body) : null,
      tenantId,
      idempotencyKey: options.idempotencyKey,
      signal: options.signal,
    });
    if (!response.bodyText) return undefined as T;
    return parseJson<T>(response) as T;
  }

  protected async httpGetPdf(
    token: XeroToken,
    tenantId: string,
    path: string,
    logicalPath: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const headers = this.headers(token);
    headers.set("Accept", "application/pdf");
    const response: XeroResponse = await this.http.request({
      method: "GET",
      url: `${this.baseUrl}${path}`,
      logicalPath,
      headers,
      tenantId,
      signal,
    });
    return response.bodyText;
  }

  protected idPath(resource: string, id: string): string {
    if (!id) throw XeroError.configError(`${resource} id is required`);
    return `/${resource}/${encodeURIComponent(id)}`;
  }
}

export function first<T>(items: T[] | undefined): T {
  if (!items || items.length === 0) {
    return undefined as T;
  }
  return items[0] as T;
}
