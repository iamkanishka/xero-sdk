import type { HttpClient } from "../../http/HttpClient.js";
import { getJson, sendJson, requestRaw, type RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

export type XeroObject = Record<string, unknown>;

export interface ListParams {
  page?: number;
  filter?: string;
}

export function toQuery(params: ListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.filter) q.set("filter", params.filter);
  return q;
}

/** Shared low-level helpers reused by the AU/NZ/UK payroll clients. */
export abstract class PayrollClientBase {
  constructor(
    protected readonly http: HttpClient,
    protected readonly baseUrl: string,
  ) {}

  protected j<T>(
    token: XeroToken,
    tenantId: string,
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return sendJson<T>(this.http, this.baseUrl, method, path, token, body, {
      ...options,
      tenantId,
    });
  }

  protected g<T>(
    token: XeroToken,
    tenantId: string,
    path: string,
    query: URLSearchParams | undefined,
    options: RequestOptions = {},
  ): Promise<T> {
    return getJson<T>(this.http, this.baseUrl, path, token, query, { ...options, tenantId });
  }

  protected async del(
    token: XeroToken,
    tenantId: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(this.http, this.baseUrl, "DELETE", path, token, { ...options, tenantId });
  }
}
