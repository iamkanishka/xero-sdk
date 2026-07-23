import type { HttpClient } from "../../http/HttpClient.js";
import { getJson, sendJson, requestRaw, type RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";
import { parseJson } from "../../http/HttpClient.js";

export type XeroObject = Record<string, unknown>;

export interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

function toQuery(params: ListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pagesize", String(params.pageSize));
  if (params.sort) q.set("sort", params.sort);
  return q;
}

/** Files API (files.xro/1.0): file/folder CRUD, uploads, downloads, inbox, and object associations. */
export class FilesClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "/Files",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  get(
    token: XeroToken,
    tenantId: string,
    fileId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/Files/${fileId}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  async download(
    token: XeroToken,
    tenantId: string,
    fileId: string,
    options: RequestOptions = {},
  ): Promise<string> {
    const response = await requestRaw(
      this.http,
      this.baseUrl,
      "GET",
      `/Files/${fileId}/Content`,
      token,
      { ...options, tenantId },
    );
    return response.bodyText;
  }

  async upload(
    token: XeroToken,
    tenantId: string,
    contentType: string,
    content: BodyInit,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    const response = await requestRaw(this.http, this.baseUrl, "POST", "/Files", token, {
      ...options,
      tenantId,
      body: content,
      contentType,
    });
    return parseJson(response) as XeroObject;
  }

  async uploadToFolder(
    token: XeroToken,
    tenantId: string,
    folderId: string,
    contentType: string,
    content: BodyInit,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    const response = await requestRaw(
      this.http,
      this.baseUrl,
      "POST",
      `/Files/${folderId}`,
      token,
      { ...options, tenantId, body: content, contentType },
    );
    return parseJson(response) as XeroObject;
  }

  rename(
    token: XeroToken,
    tenantId: string,
    fileId: string,
    newName: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "PUT",
      `/Files/${fileId}`,
      token,
      { Name: newName },
      { ...options, tenantId },
    );
  }

  moveToFolder(
    token: XeroToken,
    tenantId: string,
    fileId: string,
    folderId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "PUT",
      `/Files/${fileId}`,
      token,
      { FolderId: folderId },
      { ...options, tenantId },
    );
  }

  async delete(
    token: XeroToken,
    tenantId: string,
    fileId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(this.http, this.baseUrl, "DELETE", `/Files/${fileId}`, token, {
      ...options,
      tenantId,
    });
  }

  async folders(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    return getJson(this.http, this.baseUrl, "/Folders", token, toQuery(params), {
      ...options,
      tenantId,
    });
  }

  folder(
    token: XeroToken,
    tenantId: string,
    folderId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/Folders/${folderId}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  createFolder(
    token: XeroToken,
    tenantId: string,
    name: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      "/Folders",
      token,
      { Name: name },
      { ...options, tenantId },
    );
  }

  renameFolder(
    token: XeroToken,
    tenantId: string,
    folderId: string,
    newName: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "PUT",
      `/Folders/${folderId}`,
      token,
      { Name: newName },
      { ...options, tenantId },
    );
  }

  async deleteFolder(
    token: XeroToken,
    tenantId: string,
    folderId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(this.http, this.baseUrl, "DELETE", `/Folders/${folderId}`, token, {
      ...options,
      tenantId,
    });
  }

  async filesInFolder(
    token: XeroToken,
    tenantId: string,
    folderId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      `/Folders/${folderId}/Files`,
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  inbox(token: XeroToken, tenantId: string, options: RequestOptions = {}): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, "/Inbox", token, undefined, { ...options, tenantId });
  }

  async inboxFiles(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "/Inbox/Files",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  associate(
    token: XeroToken,
    tenantId: string,
    fileId: string,
    objectId: string,
    objectType: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      `/Files/${fileId}/Associations`,
      token,
      { ObjectId: objectId, ObjectType: objectType },
      { ...options, tenantId },
    );
  }

  associations(
    token: XeroToken,
    tenantId: string,
    objectId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    return getJson(this.http, this.baseUrl, `/Associations/${objectId}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  async disassociate(
    token: XeroToken,
    tenantId: string,
    fileId: string,
    objectId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(
      this.http,
      this.baseUrl,
      "DELETE",
      `/Files/${fileId}/Associations/${objectId}`,
      token,
      { ...options, tenantId },
    );
  }

  listAssociationsForObject(
    token: XeroToken,
    tenantId: string,
    objectId: string,
    objectType: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const q = new URLSearchParams({ objectType });
    return getJson(this.http, this.baseUrl, `/Associations/${objectId}`, token, q, {
      ...options,
      tenantId,
    });
  }
}
