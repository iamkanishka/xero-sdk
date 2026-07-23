import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { XeroObject, HistoryRecord } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

/** Shared implementation for Overpayments and Prepayments — Xero's two "excess payment not yet allocated" resources, identical in shape. */
abstract class ExcessPaymentResourceBase extends AccountingResourceBase {
  protected abstract readonly resource: "Overpayments" | "Prepayments";

  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<Record<string, XeroObject[]>>(
      token,
      tenantId,
      `/${this.resource}`,
      params,
      signal,
    );
    return env[this.resource] ?? [];
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<Record<string, XeroObject[]>>(
      token,
      tenantId,
      this.idPath(this.resource, id),
      {},
      signal,
    );
    return first(env[this.resource]);
  }

  async allocate(
    token: XeroToken,
    tenantId: string,
    id: string,
    allocation: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ Allocations: XeroObject[] }>(
      token,
      tenantId,
      "PUT",
      `${this.idPath(this.resource, id)}/Allocations`,
      { Allocations: [allocation] },
      { signal },
    );
    return first(env.Allocations);
  }

  async deleteAllocation(
    token: XeroToken,
    tenantId: string,
    id: string,
    allocationId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(
      token,
      tenantId,
      "DELETE",
      `${this.idPath(this.resource, id)}/Allocations/${allocationId}`,
      undefined,
      { signal },
    );
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
      `${this.idPath(this.resource, id)}/history`,
      {},
      signal,
    );
    return env.HistoryRecords;
  }
}

/** Overpayments — excess customer payments not yet allocated. */
export class OverpaymentsResource extends ExcessPaymentResourceBase {
  protected readonly resource = "Overpayments" as const;
}

/** Prepayments — advance customer/supplier payments not yet allocated. */
export class PrepaymentsResource extends ExcessPaymentResourceBase {
  protected readonly resource = "Prepayments" as const;
}
