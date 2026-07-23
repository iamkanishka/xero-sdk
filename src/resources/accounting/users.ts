import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

export class UsersResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ Users: XeroObject[] }>(
      token,
      tenantId,
      "/Users",
      params,
      signal,
    );
    return env.Users;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<{ Users: XeroObject[] }>(
      token,
      tenantId,
      this.idPath("Users", id),
      {},
      signal,
    );
    return first(env.Users);
  }
}
