import type { HttpClient } from "../../http/HttpClient.js";
import { getJson, sendJson, type RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

export type XeroObject = Record<string, unknown>;

export interface ListParams {
  page?: number;
  pageSize?: number;
}

function toQuery(params: ListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  return q;
}

/**
 * App Store partner API (appstore/2.0): subscriptions and usage
 * records for listed apps with usage-based billing. Unlike every other
 * domain, this API is authenticated via OAuth 2.0 Client Credentials
 * (no user/tenant context) — see `client.auth.clientCredentialsToken()`.
 */
export class AppStoreClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  /** Lists subscriptions for this app across all installing organisations. */
  listSubscriptions(token: XeroToken, options: RequestOptions = {}): Promise<XeroObject[]> {
    return getJson(this.http, this.baseUrl, "/subscriptions", token, undefined, options);
  }

  getSubscription(
    token: XeroToken,
    subscriptionId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(
      this.http,
      this.baseUrl,
      `/subscriptions/${subscriptionId}`,
      token,
      undefined,
      options,
    );
  }

  /** Records usage against a subscription's metered plan (for usage-based billing). */
  createUsageRecord(
    token: XeroToken,
    subscriptionId: string,
    planId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      `/subscriptions/${subscriptionId}/plans/${planId}/UsageRecords`,
      token,
      attrs,
      options,
    );
  }

  listUsageRecords(
    token: XeroToken,
    subscriptionId: string,
    planId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    return getJson(
      this.http,
      this.baseUrl,
      `/subscriptions/${subscriptionId}/plans/${planId}/UsageRecords`,
      token,
      toQuery(params),
      options,
    );
  }

  getUsageRecord(
    token: XeroToken,
    subscriptionId: string,
    planId: string,
    usageRecordId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(
      this.http,
      this.baseUrl,
      `/subscriptions/${subscriptionId}/plans/${planId}/UsageRecords/${usageRecordId}`,
      token,
      undefined,
      options,
    );
  }
}
