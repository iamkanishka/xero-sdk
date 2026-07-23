import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { BankTransfer } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

interface Envelope {
  BankTransfers: BankTransfer[];
}

export class BankTransfersResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<BankTransfer[]> {
    const env = await this.httpGet<Envelope>(token, tenantId, "/BankTransfers", params, signal);
    return env.BankTransfers;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<BankTransfer> {
    const env = await this.httpGet<Envelope>(
      token,
      tenantId,
      this.idPath("BankTransfers", id),
      {},
      signal,
    );
    return first(env.BankTransfers);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    transfer: BankTransfer,
    signal?: AbortSignal,
  ): Promise<BankTransfer> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "PUT",
      "/BankTransfers",
      { BankTransfers: [transfer] },
      { signal },
    );
    return first(env.BankTransfers);
  }

  async delete(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(token, tenantId, "DELETE", this.idPath("BankTransfers", id), undefined, {
      signal,
    });
  }
}
