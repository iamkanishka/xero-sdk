import { AccountingResourceBase } from "./base.js";
import type { HistoryRecord } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

/** Generic audit trail / notes, usable against any Accounting entity that supports history (Invoices, Contacts, ManualJournals, ...). */
export class HistoryResource extends AccountingResourceBase {
  async get(
    token: XeroToken,
    tenantId: string,
    resource: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<HistoryRecord[]> {
    const env = await this.httpGet<{ HistoryRecords: HistoryRecord[] }>(
      token,
      tenantId,
      `${this.idPath(resource, id)}/history`,
      {},
      signal,
    );
    return env.HistoryRecords;
  }

  async addNote(
    token: XeroToken,
    tenantId: string,
    resource: string,
    id: string,
    details: string,
    signal?: AbortSignal,
  ): Promise<HistoryRecord[]> {
    const env = await this.httpSend<{ HistoryRecords: HistoryRecord[] }>(
      token,
      tenantId,
      "PUT",
      `${this.idPath(resource, id)}/history`,
      { HistoryRecords: [{ Details: details }] },
      { signal },
    );
    return env.HistoryRecords;
  }
}
