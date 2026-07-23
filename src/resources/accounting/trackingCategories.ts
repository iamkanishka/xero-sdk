import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { TrackingCategory, TrackingOption } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

interface Envelope {
  TrackingCategories: TrackingCategory[];
}

export class TrackingCategoriesResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<TrackingCategory[]> {
    const env = await this.httpGet<Envelope>(
      token,
      tenantId,
      "/TrackingCategories",
      params,
      signal,
    );
    return env.TrackingCategories;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<TrackingCategory> {
    const env = await this.httpGet<Envelope>(
      token,
      tenantId,
      this.idPath("TrackingCategories", id),
      {},
      signal,
    );
    return first(env.TrackingCategories);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    category: TrackingCategory,
    signal?: AbortSignal,
  ): Promise<TrackingCategory> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "PUT",
      "/TrackingCategories",
      { TrackingCategories: [category] },
      { signal },
    );
    return first(env.TrackingCategories);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    id: string,
    category: TrackingCategory,
    signal?: AbortSignal,
  ): Promise<TrackingCategory> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "POST",
      this.idPath("TrackingCategories", id),
      { TrackingCategories: [category] },
      { signal },
    );
    return first(env.TrackingCategories);
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
      this.idPath("TrackingCategories", id),
      undefined,
      { signal },
    );
  }

  async createOption(
    token: XeroToken,
    tenantId: string,
    categoryId: string,
    option: TrackingOption,
    signal?: AbortSignal,
  ): Promise<TrackingOption> {
    const env = await this.httpSend<{ Options: TrackingOption[] }>(
      token,
      tenantId,
      "PUT",
      `${this.idPath("TrackingCategories", categoryId)}/Options`,
      option,
      { signal },
    );
    return first(env.Options);
  }

  async updateOption(
    token: XeroToken,
    tenantId: string,
    categoryId: string,
    optionId: string,
    option: TrackingOption,
    signal?: AbortSignal,
  ): Promise<TrackingOption> {
    const env = await this.httpSend<{ Options: TrackingOption[] }>(
      token,
      tenantId,
      "POST",
      `${this.idPath("TrackingCategories", categoryId)}/Options/${optionId}`,
      option,
      { signal },
    );
    return first(env.Options);
  }

  async deleteOption(
    token: XeroToken,
    tenantId: string,
    categoryId: string,
    optionId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(
      token,
      tenantId,
      "DELETE",
      `${this.idPath("TrackingCategories", categoryId)}/Options/${optionId}`,
      undefined,
      { signal },
    );
  }
}
