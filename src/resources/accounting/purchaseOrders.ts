import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { PurchaseOrder } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, type FetchPageFn } from "../../pagination/index.js";

interface PurchaseOrdersEnvelope {
  PurchaseOrders: PurchaseOrder[];
}

export class PurchaseOrdersResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<PurchaseOrder[]> {
    const env = await this.httpGet<PurchaseOrdersEnvelope>(
      token,
      tenantId,
      "/PurchaseOrders",
      params,
      signal,
    );
    return env.PurchaseOrders;
  }

  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<PurchaseOrder, void, void> {
    const fetchPage: FetchPageFn<PurchaseOrder> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    purchaseOrderId: string,
    signal?: AbortSignal,
  ): Promise<PurchaseOrder> {
    const env = await this.httpGet<PurchaseOrdersEnvelope>(
      token,
      tenantId,
      this.idPath("PurchaseOrders", purchaseOrderId),
      {},
      signal,
    );
    return first(env.PurchaseOrders);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    po: PurchaseOrder,
    signal?: AbortSignal,
  ): Promise<PurchaseOrder> {
    const env = await this.httpSend<PurchaseOrdersEnvelope>(
      token,
      tenantId,
      "POST",
      "/PurchaseOrders",
      { PurchaseOrders: [po] },
      { signal },
    );
    return first(env.PurchaseOrders);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    purchaseOrderId: string,
    po: PurchaseOrder,
    signal?: AbortSignal,
  ): Promise<PurchaseOrder> {
    const env = await this.httpSend<PurchaseOrdersEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("PurchaseOrders", purchaseOrderId),
      { PurchaseOrders: [po] },
      { signal },
    );
    return first(env.PurchaseOrders);
  }

  delete(
    token: XeroToken,
    tenantId: string,
    purchaseOrderId: string,
    signal?: AbortSignal,
  ): Promise<PurchaseOrder> {
    return this.update(
      token,
      tenantId,
      purchaseOrderId,
      { PurchaseOrderID: purchaseOrderId, Status: "DELETED" },
      signal,
    );
  }

  getAsPdf(
    token: XeroToken,
    tenantId: string,
    purchaseOrderId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.httpGetPdf(
      token,
      tenantId,
      `${this.idPath("PurchaseOrders", purchaseOrderId)}/pdf`,
      "/PurchaseOrders/{id}/pdf",
      signal,
    );
  }
}
