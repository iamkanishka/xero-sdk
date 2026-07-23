import type { HttpClient } from "../../http/HttpClient.js";
import { getJson, sendJson, requestRaw, type RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

export type XeroObject = Record<string, unknown>;

export interface ListParams {
  page?: number;
  pageSize?: number;
  feedConnectionId?: string;
}

function toQuery(params: ListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.feedConnectionId) q.set("feedConnectionId", params.feedConnectionId);
  return q;
}

/** Bank Feeds API (bankfeeds.xro/1.0): bank connections and statements, used by bank-feed partner integrations. */
export class BankFeedsClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  async listBankConnections(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "/FeedConnections",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  getBankConnection(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/FeedConnections/${id}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  async createBankConnection(
    token: XeroToken,
    tenantId: string,
    connections: XeroObject[],
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await sendJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "POST",
      "/FeedConnections",
      token,
      { items: connections },
      { ...options, tenantId },
    );
    return env.Items;
  }

  /** Deletes bank feed connections. Note: this is a POST to `/FeedConnections/DeleteRequests`, not an HTTP DELETE — that's how the Bank Feeds API models bulk deletion. */
  deleteBankConnections(
    token: XeroToken,
    tenantId: string,
    ids: string[],
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    const items = ids.map((id) => ({ id }));
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      "/FeedConnections/DeleteRequests",
      token,
      { items },
      { ...options, tenantId },
    );
  }

  async listStatements(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "/Statements",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  getStatement(
    token: XeroToken,
    tenantId: string,
    statementId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/Statements/${statementId}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  /** Pushes one or more bank statements (each with StatementLines) into Xero for auto-reconciliation. */
  createStatements(
    token: XeroToken,
    tenantId: string,
    statements: XeroObject[],
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      "/Statements",
      token,
      { items: statements },
      { ...options, tenantId },
    );
  }

  async deleteStatement(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(this.http, this.baseUrl, "DELETE", `/Statements/${id}`, token, {
      ...options,
      tenantId,
    });
  }
}
