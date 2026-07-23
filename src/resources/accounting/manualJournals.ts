import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { ManualJournal } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, type FetchPageFn } from "../../pagination/index.js";

interface ManualJournalsEnvelope {
  ManualJournals: ManualJournal[];
}

export class ManualJournalsResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<ManualJournal[]> {
    const env = await this.httpGet<ManualJournalsEnvelope>(
      token,
      tenantId,
      "/ManualJournals",
      params,
      signal,
    );
    return env.ManualJournals;
  }

  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<ManualJournal, void, void> {
    const fetchPage: FetchPageFn<ManualJournal> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<ManualJournal> {
    const env = await this.httpGet<ManualJournalsEnvelope>(
      token,
      tenantId,
      this.idPath("ManualJournals", id),
      {},
      signal,
    );
    return first(env.ManualJournals);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    mj: ManualJournal,
    signal?: AbortSignal,
  ): Promise<ManualJournal> {
    const env = await this.httpSend<ManualJournalsEnvelope>(
      token,
      tenantId,
      "POST",
      "/ManualJournals",
      { ManualJournals: [mj] },
      { signal },
    );
    return first(env.ManualJournals);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    id: string,
    mj: ManualJournal,
    signal?: AbortSignal,
  ): Promise<ManualJournal> {
    const env = await this.httpSend<ManualJournalsEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("ManualJournals", id),
      { ManualJournals: [mj] },
      { signal },
    );
    return first(env.ManualJournals);
  }

  /** Voids a manual journal (Xero has no hard delete — sets status to VOIDED). */
  delete(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<ManualJournal> {
    return this.update(token, tenantId, id, { ManualJournalID: id, Status: "VOIDED" }, signal);
  }
}
