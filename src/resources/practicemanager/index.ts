import type { HttpClient } from "../../http/HttpClient.js";
import { buildHeaders } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

/**
 * Practice Manager v3.1 (practicemanager/3.1): accounting-practice
 * workflow management — jobs, job notes, job costs, clients, staff,
 * time, tasks, categories, templates, and invoice export.
 *
 * Unlike every other Xero API, Practice Manager's endpoints (`.api`
 * suffixed, e.g. `/job.api`) accept identifiers as query-string
 * parameters rather than path segments, and it **always returns raw
 * XML**, never JSON, regardless of request headers. This client
 * reflects that faithfully — every method takes a `Record<string,
 * string>` of query filters (for GET) or attributes (for POST) and
 * resolves with the raw XML response text for you to parse with your
 * XML library of choice, rather than pretending it's a JSON API like
 * the rest of the SDK.
 */
export class PracticeManagerClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  private toQuery(params: Record<string, string> = {}): URLSearchParams {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) q.set(k, v);
    }
    return q;
  }

  private async get(
    token: XeroToken,
    tenantId: string,
    path: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<string> {
    const query = this.toQuery(params);
    const url = `${this.baseUrl}${path}${[...query.keys()].length ? `?${query.toString()}` : ""}`;
    const response = await this.http.request({
      method: "GET",
      url,
      logicalPath: path,
      headers: buildHeaders(token),
      tenantId,
      signal,
    });
    return response.bodyText;
  }

  private async post(
    token: XeroToken,
    tenantId: string,
    path: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    const response = await this.http.request({
      method: "POST",
      url: `${this.baseUrl}${path}`,
      logicalPath: path,
      headers: buildHeaders(token, "application/json"),
      body: JSON.stringify(attrs),
      tenantId,
      signal,
    });
    return response.bodyText;
  }

  private async del(
    token: XeroToken,
    tenantId: string,
    path: string,
    idParam: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<void> {
    const q = new URLSearchParams({ [idParam]: id });
    await this.http.request({
      method: "DELETE",
      url: `${this.baseUrl}${path}?${q.toString()}`,
      logicalPath: path,
      headers: buildHeaders(token),
      tenantId,
      signal,
    });
  }

  private static mergeId(
    attrs: Record<string, string>,
    idParam: string,
    id: string,
  ): Record<string, string> {
    return { ...attrs, [idParam]: id };
  }

  // -- Jobs --------------------------------------------------------------
  listJobs(
    token: XeroToken,
    tenantId: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/job.api", params, signal);
  }
  getJob(token: XeroToken, tenantId: string, jobId: string, signal?: AbortSignal): Promise<string> {
    return this.get(token, tenantId, "/job.api", { jobid: jobId }, signal);
  }
  createJob(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/job.api", attrs, signal);
  }
  updateJob(
    token: XeroToken,
    tenantId: string,
    jobId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/job.api",
      PracticeManagerClient.mergeId(attrs, "jobid", jobId),
      signal,
    );
  }
  /** Transitions a job's status (Prospect | NotStarted | InProgress | Overdue | Completed | Cancelled). */
  updateJobState(
    token: XeroToken,
    tenantId: string,
    jobId: string,
    state: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/job.api", { jobid: jobId, state }, signal);
  }
  deleteJob(
    token: XeroToken,
    tenantId: string,
    jobId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/job.api", "jobid", jobId, signal);
  }

  // -- Job Notes -----------------------------------------------------------
  listJobNotes(
    token: XeroToken,
    tenantId: string,
    jobId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/jobnote.api", { jobid: jobId }, signal);
  }
  createJobNote(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/jobnote.api", attrs, signal);
  }
  updateJobNote(
    token: XeroToken,
    tenantId: string,
    jobNoteId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/jobnote.api",
      PracticeManagerClient.mergeId(attrs, "jobnoteid", jobNoteId),
      signal,
    );
  }
  deleteJobNote(
    token: XeroToken,
    tenantId: string,
    jobNoteId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/jobnote.api", "jobnoteid", jobNoteId, signal);
  }

  // -- Job Costs -----------------------------------------------------------
  listJobCosts(
    token: XeroToken,
    tenantId: string,
    jobId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/cost.api", { jobid: jobId }, signal);
  }
  createJobCost(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/cost.api", attrs, signal);
  }
  updateJobCost(
    token: XeroToken,
    tenantId: string,
    costId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/cost.api",
      PracticeManagerClient.mergeId(attrs, "costid", costId),
      signal,
    );
  }
  deleteJobCost(
    token: XeroToken,
    tenantId: string,
    costId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/cost.api", "costid", costId, signal);
  }

  // -- Clients ---------------------------------------------------------------
  listClients(
    token: XeroToken,
    tenantId: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/client.api", params, signal);
  }
  getClient(
    token: XeroToken,
    tenantId: string,
    clientId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/client.api", { clientid: clientId }, signal);
  }
  createClient(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/client.api", attrs, signal);
  }
  updateClient(
    token: XeroToken,
    tenantId: string,
    clientId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/client.api",
      PracticeManagerClient.mergeId(attrs, "clientid", clientId),
      signal,
    );
  }
  deleteClient(
    token: XeroToken,
    tenantId: string,
    clientId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/client.api", "clientid", clientId, signal);
  }

  // -- Staff -------------------------------------------------------------------
  listStaff(
    token: XeroToken,
    tenantId: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/staff.api", params, signal);
  }
  getStaff(
    token: XeroToken,
    tenantId: string,
    staffId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/staff.api", { staffid: staffId }, signal);
  }
  createStaff(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/staff.api", attrs, signal);
  }
  updateStaff(
    token: XeroToken,
    tenantId: string,
    staffId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/staff.api",
      PracticeManagerClient.mergeId(attrs, "staffid", staffId),
      signal,
    );
  }

  // -- Time --------------------------------------------------------------------
  listTime(
    token: XeroToken,
    tenantId: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/time.api", params, signal);
  }
  createTime(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/time.api", attrs, signal);
  }
  updateTime(
    token: XeroToken,
    tenantId: string,
    timeId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/time.api",
      PracticeManagerClient.mergeId(attrs, "timeid", timeId),
      signal,
    );
  }
  deleteTime(
    token: XeroToken,
    tenantId: string,
    timeId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/time.api", "timeid", timeId, signal);
  }

  // -- Tasks -------------------------------------------------------------------
  listTasks(
    token: XeroToken,
    tenantId: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/task.api", params, signal);
  }
  createTask(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/task.api", attrs, signal);
  }
  updateTask(
    token: XeroToken,
    tenantId: string,
    taskId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/task.api",
      PracticeManagerClient.mergeId(attrs, "taskid", taskId),
      signal,
    );
  }
  deleteTask(
    token: XeroToken,
    tenantId: string,
    taskId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/task.api", "taskid", taskId, signal);
  }

  // -- Categories ----------------------------------------------------------------
  listCategories(token: XeroToken, tenantId: string, signal?: AbortSignal): Promise<string> {
    return this.get(token, tenantId, "/category.api", {}, signal);
  }
  createCategory(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/category.api", attrs, signal);
  }
  updateCategory(
    token: XeroToken,
    tenantId: string,
    categoryId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/category.api",
      PracticeManagerClient.mergeId(attrs, "categoryid", categoryId),
      signal,
    );
  }
  deleteCategory(
    token: XeroToken,
    tenantId: string,
    categoryId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/category.api", "categoryid", categoryId, signal);
  }

  // -- Templates -----------------------------------------------------------------
  listTemplates(token: XeroToken, tenantId: string, signal?: AbortSignal): Promise<string> {
    return this.get(token, tenantId, "/template.api", {}, signal);
  }
  createTemplate(
    token: XeroToken,
    tenantId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(token, tenantId, "/template.api", attrs, signal);
  }
  updateTemplate(
    token: XeroToken,
    tenantId: string,
    templateId: string,
    attrs: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.post(
      token,
      tenantId,
      "/template.api",
      PracticeManagerClient.mergeId(attrs, "templateid", templateId),
      signal,
    );
  }
  deleteTemplate(
    token: XeroToken,
    tenantId: string,
    templateId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.del(token, tenantId, "/template.api", "templateid", templateId, signal);
  }

  // -- Invoices ------------------------------------------------------------------
  /** Exports invoices for a date range. `params` supports from, to, jobid, clientid. */
  exportInvoices(
    token: XeroToken,
    tenantId: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<string> {
    return this.get(token, tenantId, "/invoice.api", params, signal);
  }
}
