import type { HttpClient } from "../../http/HttpClient.js";
import { getJson, sendJson, requestRaw, type RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

/** Flexible JSON object for Asset/AssetType/Depreciation resources. */
export type XeroObject = Record<string, unknown>;

export interface ListParams {
  status?: "DRAFT" | "REGISTERED" | "DISPOSED" | string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  sortDirection?: "ASC" | "DESC" | string;
  filterBy?: string;
}

function toQuery(params: ListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.orderBy) q.set("orderBy", params.orderBy);
  if (params.sortDirection) q.set("sortDirection", params.sortDirection);
  if (params.filterBy) q.set("filterBy", params.filterBy);
  return q;
}

/** Fixed Assets API (assets.xro/1.0): asset CRUD, disposal, asset types, depreciation. */
export class AssetsClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<{ items: XeroObject[]; pagination?: XeroObject }> {
    const env = await getJson<{ Items: XeroObject[]; Pagination?: XeroObject }>(
      this.http,
      this.baseUrl,
      "/Assets",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return { items: env.Items, pagination: env.Pagination };
  }

  get(
    token: XeroToken,
    tenantId: string,
    assetId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/Assets/${assetId}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  create(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", "/Assets", token, attrs, {
      ...options,
      tenantId,
    });
  }

  update(
    token: XeroToken,
    tenantId: string,
    assetId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "PUT", `/Assets/${assetId}`, token, attrs, {
      ...options,
      tenantId,
    });
  }

  dispose(
    token: XeroToken,
    tenantId: string,
    assetId: string,
    disposal: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      `/Assets/${assetId}/Dispose`,
      token,
      disposal,
      { ...options, tenantId },
    );
  }

  async delete(
    token: XeroToken,
    tenantId: string,
    assetId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(this.http, this.baseUrl, "DELETE", `/Assets/${assetId}`, token, {
      ...options,
      tenantId,
    });
  }

  settings(token: XeroToken, tenantId: string, options: RequestOptions = {}): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, "/Settings", token, undefined, {
      ...options,
      tenantId,
    });
  }

  async assetTypes(
    token: XeroToken,
    tenantId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    return getJson<XeroObject[]>(this.http, this.baseUrl, "/AssetTypes", token, undefined, {
      ...options,
      tenantId,
    });
  }

  createAssetType(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", "/AssetTypes", token, attrs, {
      ...options,
      tenantId,
    });
  }

  updateAssetType(
    token: XeroToken,
    tenantId: string,
    assetTypeId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "PUT", `/AssetTypes/${assetTypeId}`, token, attrs, {
      ...options,
      tenantId,
    });
  }

  /** Previews depreciation schedules for all registered assets as of `bookEffectiveDateOfDepreciation` (YYYY-MM-DD; omit to use today). */
  depreciationSchedules(
    token: XeroToken,
    tenantId: string,
    bookEffectiveDateOfDepreciation?: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const q = new URLSearchParams();
    if (bookEffectiveDateOfDepreciation)
      q.set("bookEffectiveDateOfDepreciation", bookEffectiveDateOfDepreciation);
    return getJson(this.http, this.baseUrl, "/Assets/Schedules", token, q, {
      ...options,
      tenantId,
    });
  }

  runDepreciation(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", "/Assets/Depreciation", token, attrs, {
      ...options,
      tenantId,
    });
  }
}
