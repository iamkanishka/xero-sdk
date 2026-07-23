import { AccountingResourceBase, first } from "./base.js";
import type { XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

/** Query options for the read-only, system-generated Journals feed, which uses offset-based paging. */
export interface JournalParams {
  offsetJournalNumber?: number;
  paymentsOnly?: boolean;
}

function toQuery(params: JournalParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.offsetJournalNumber) q.set("offset", String(params.offsetJournalNumber));
  if (params.paymentsOnly) q.set("paymentsOnly", "true");
  return q;
}

/** The system-generated Journals feed (read-only; distinct from ManualJournals). */
export class JournalsResource extends AccountingResourceBase {
  /** Use `params.offsetJournalNumber` to page forward from the highest JournalNumber you've already seen. */
  async list(
    token: XeroToken,
    tenantId: string,
    params: JournalParams = {},
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const query = toQuery(params);
    const url = `${this.baseUrl}/Journals${query.toString() ? `?${query.toString()}` : ""}`;
    const env = await this.httpGetRaw<{ Journals: XeroObject[] }>(
      token,
      tenantId,
      url,
      "/Journals",
      signal,
    );
    return env.Journals;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<{ Journals: XeroObject[] }>(
      token,
      tenantId,
      this.idPath("Journals", id),
      {},
      signal,
    );
    return first(env.Journals);
  }
}
