import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

interface Envelope {
  LinkedTransactions: XeroObject[];
}

/** Billable-expense links between a source (e.g. supplier bill line) and a target sales invoice. */
export class LinkedTransactionsResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<Envelope>(
      token,
      tenantId,
      "/LinkedTransactions",
      params,
      signal,
    );
    return env.LinkedTransactions;
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
      this.idPath("LinkedTransactions", id),
      {},
      signal,
    );
    return first(env.LinkedTransactions);
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
      "/LinkedTransactions",
      attrs,
      { signal },
    );
    return first(env.LinkedTransactions);
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
      this.idPath("LinkedTransactions", id),
      attrs,
      { signal },
    );
    return first(env.LinkedTransactions);
  }

  async delete(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(
      token,
      tenantId,
      "DELETE",
      this.idPath("LinkedTransactions", id),
      undefined,
      { signal },
    );
  }
}
