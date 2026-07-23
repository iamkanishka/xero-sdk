import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { CreditNote, XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, type FetchPageFn } from "../../pagination/index.js";

interface CreditNotesEnvelope {
  CreditNotes: CreditNote[];
}

export class CreditNotesResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<CreditNote[]> {
    const env = await this.httpGet<CreditNotesEnvelope>(
      token,
      tenantId,
      "/CreditNotes",
      params,
      signal,
    );
    return env.CreditNotes;
  }

  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<CreditNote, void, void> {
    const fetchPage: FetchPageFn<CreditNote> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    creditNoteId: string,
    signal?: AbortSignal,
  ): Promise<CreditNote> {
    const env = await this.httpGet<CreditNotesEnvelope>(
      token,
      tenantId,
      this.idPath("CreditNotes", creditNoteId),
      {},
      signal,
    );
    return first(env.CreditNotes);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    creditNote: CreditNote,
    signal?: AbortSignal,
  ): Promise<CreditNote> {
    const env = await this.httpSend<CreditNotesEnvelope>(
      token,
      tenantId,
      "PUT",
      "/CreditNotes",
      { CreditNotes: [creditNote] },
      { signal },
    );
    return first(env.CreditNotes);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    creditNoteId: string,
    creditNote: CreditNote,
    signal?: AbortSignal,
  ): Promise<CreditNote> {
    const env = await this.httpSend<CreditNotesEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("CreditNotes", creditNoteId),
      { CreditNotes: [creditNote] },
      { signal },
    );
    return first(env.CreditNotes);
  }

  async allocate(
    token: XeroToken,
    tenantId: string,
    creditNoteId: string,
    allocation: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ Allocations: XeroObject[] }>(
      token,
      tenantId,
      "PUT",
      `${this.idPath("CreditNotes", creditNoteId)}/Allocations`,
      { Allocations: [allocation] },
      { signal },
    );
    return first(env.Allocations);
  }

  async deleteAllocation(
    token: XeroToken,
    tenantId: string,
    creditNoteId: string,
    allocationId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(
      token,
      tenantId,
      "DELETE",
      `${this.idPath("CreditNotes", creditNoteId)}/Allocations/${allocationId}`,
      undefined,
      { signal },
    );
  }

  getAsPdf(
    token: XeroToken,
    tenantId: string,
    creditNoteId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.httpGetPdf(
      token,
      tenantId,
      `${this.idPath("CreditNotes", creditNoteId)}/pdf`,
      "/CreditNotes/{id}/pdf",
      signal,
    );
  }
}
