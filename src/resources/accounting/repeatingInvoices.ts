import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { XeroObject, HistoryRecord } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

interface Envelope {
  RepeatingInvoices: XeroObject[];
}

export class RepeatingInvoicesResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<Envelope>(token, tenantId, "/RepeatingInvoices", params, signal);
    return env.RepeatingInvoices;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<Envelope>(
      token,
      tenantId,
      this.idPath("RepeatingInvoices", id),
      {},
      signal,
    );
    return first(env.RepeatingInvoices);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "PUT",
      "/RepeatingInvoices",
      { RepeatingInvoices: [attrs] },
      { signal },
    );
    return first(env.RepeatingInvoices);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "POST",
      this.idPath("RepeatingInvoices", id),
      { RepeatingInvoices: [attrs] },
      { signal },
    );
    return first(env.RepeatingInvoices);
  }

  delete(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    return this.update(token, tenantId, id, { Status: "DELETED" }, signal);
  }

  async getHistory(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<HistoryRecord[]> {
    const env = await this.httpGet<{ HistoryRecords: HistoryRecord[] }>(
      token,
      tenantId,
      `${this.idPath("RepeatingInvoices", id)}/history`,
      {},
      signal,
    );
    return env.HistoryRecords;
  }

  async listAttachments(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ Attachments: XeroObject[] }>(
      token,
      tenantId,
      `${this.idPath("RepeatingInvoices", id)}/Attachments`,
      {},
      signal,
    );
    return env.Attachments;
  }
}
