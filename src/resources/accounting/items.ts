import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { Item, HistoryRecord } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

interface ItemsEnvelope {
  Items: Item[];
}

/** Product/service catalog. */
export class ItemsResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Item[]> {
    const env = await this.httpGet<ItemsEnvelope>(token, tenantId, "/Items", params, signal);
    return env.Items;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    itemId: string,
    signal?: AbortSignal,
  ): Promise<Item> {
    const env = await this.httpGet<ItemsEnvelope>(
      token,
      tenantId,
      this.idPath("Items", itemId),
      {},
      signal,
    );
    return first(env.Items);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    item: Item,
    signal?: AbortSignal,
  ): Promise<Item> {
    const env = await this.httpSend<ItemsEnvelope>(
      token,
      tenantId,
      "PUT",
      "/Items",
      { Items: [item] },
      { signal },
    );
    return first(env.Items);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    itemId: string,
    item: Item,
    signal?: AbortSignal,
  ): Promise<Item> {
    const env = await this.httpSend<ItemsEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("Items", itemId),
      { Items: [item] },
      { signal },
    );
    return first(env.Items);
  }

  async delete(
    token: XeroToken,
    tenantId: string,
    itemId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(token, tenantId, "DELETE", this.idPath("Items", itemId), undefined, {
      signal,
    });
  }

  async getHistory(
    token: XeroToken,
    tenantId: string,
    itemId: string,
    signal?: AbortSignal,
  ): Promise<HistoryRecord[]> {
    const env = await this.httpGet<{ HistoryRecords: HistoryRecord[] }>(
      token,
      tenantId,
      `${this.idPath("Items", itemId)}/history`,
      {},
      signal,
    );
    return env.HistoryRecords;
  }
}
