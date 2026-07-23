import type { HttpClient } from "../../http/HttpClient.js";
import {
  getJson,
  sendJson,
  requestRaw,
  buildHeaders,
  type RequestOptions,
} from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

export type XeroObject = Record<string, unknown>;

export interface ListParams {
  page?: number;
  pageSize?: number;
  contactId?: string;
  /** ALL | INPROGRESS | CLOSED */
  states?: string;
}

function toQuery(params: ListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.contactId) q.set("contactID", params.contactId);
  if (params.states) q.set("states", params.states);
  return q;
}

/** Projects API (projects.xro/2.0): projects, tasks, time entries, non-time project items, and assignable users. */
export class ProjectsClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  async listProjects(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "/Projects",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  getProject(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/Projects/${projectId}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  createProject(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", "/Projects", token, attrs, {
      ...options,
      tenantId,
    });
  }

  updateProject(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "PUT", `/Projects/${projectId}`, token, attrs, {
      ...options,
      tenantId,
    });
  }

  /** Marks a project CLOSED (irreversible). Issued as POST with `X-HTTP-Method-Override: PATCH`, matching Xero's API. */
  closeProject(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.patchStatus(token, tenantId, projectId, "CLOSED", options);
  }

  /** Cancels a project (no further billing). */
  cancelProject(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.patchStatus(token, tenantId, projectId, "CANCELLED", options);
  }

  private async patchStatus(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    status: string,
    options: RequestOptions,
  ): Promise<void> {
    const headers = buildHeaders(token, "application/json");
    headers.set("X-HTTP-Method-Override", "PATCH");
    await this.http.request({
      method: "POST",
      url: `${this.baseUrl}/Projects/${projectId}`,
      logicalPath: "/Projects/{id}",
      headers,
      body: JSON.stringify({ status }),
      tenantId,
      signal: options.signal,
    });
  }

  async listTasks(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      `/Projects/${projectId}/Tasks`,
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  getTask(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    taskId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(
      this.http,
      this.baseUrl,
      `/Projects/${projectId}/Tasks/${taskId}`,
      token,
      undefined,
      { ...options, tenantId },
    );
  }

  createTask(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", `/Projects/${projectId}/Tasks`, token, attrs, {
      ...options,
      tenantId,
    });
  }

  updateTask(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    taskId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "PUT",
      `/Projects/${projectId}/Tasks/${taskId}`,
      token,
      attrs,
      { ...options, tenantId },
    );
  }

  async deleteTask(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    taskId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(
      this.http,
      this.baseUrl,
      "DELETE",
      `/Projects/${projectId}/Tasks/${taskId}`,
      token,
      { ...options, tenantId },
    );
  }

  async listTimeEntries(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      `/Projects/${projectId}/Time`,
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  getTimeEntry(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    timeEntryId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(
      this.http,
      this.baseUrl,
      `/Projects/${projectId}/Time/${timeEntryId}`,
      token,
      undefined,
      { ...options, tenantId },
    );
  }

  createTimeEntry(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", `/Projects/${projectId}/Time`, token, attrs, {
      ...options,
      tenantId,
    });
  }

  updateTimeEntry(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    timeEntryId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "PUT",
      `/Projects/${projectId}/Time/${timeEntryId}`,
      token,
      attrs,
      { ...options, tenantId },
    );
  }

  async deleteTimeEntry(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    timeEntryId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(
      this.http,
      this.baseUrl,
      "DELETE",
      `/Projects/${projectId}/Time/${timeEntryId}`,
      token,
      { ...options, tenantId },
    );
  }

  /** Non-time charges (expenses, products) billed against a project. */
  async listProjectItems(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      `/Projects/${projectId}/ProjectItems`,
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }

  getProjectItem(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    itemId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(
      this.http,
      this.baseUrl,
      `/Projects/${projectId}/ProjectItems/${itemId}`,
      token,
      undefined,
      { ...options, tenantId },
    );
  }

  createProjectItem(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      `/Projects/${projectId}/ProjectItems`,
      token,
      attrs,
      { ...options, tenantId },
    );
  }

  updateProjectItem(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    itemId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "PUT",
      `/Projects/${projectId}/ProjectItems/${itemId}`,
      token,
      attrs,
      { ...options, tenantId },
    );
  }

  async deleteProjectItem(
    token: XeroToken,
    tenantId: string,
    projectId: string,
    itemId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await requestRaw(
      this.http,
      this.baseUrl,
      "DELETE",
      `/Projects/${projectId}/ProjectItems/${itemId}`,
      token,
      { ...options, tenantId },
    );
  }

  /** Users who can be assigned to projects in this organisation. */
  async listUsers(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ Items: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "/ProjectsUsers",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.Items;
  }
}
