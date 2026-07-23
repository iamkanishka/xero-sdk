import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { Account, XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

interface AccountsEnvelope {
  Accounts: Account[];
}
interface AttachmentsEnvelope {
  Attachments: XeroObject[];
}

/**
 * The chart of accounts. Accounts is not paginated by Xero (typically
 * a few hundred rows at most), so {@link list} always returns the full
 * set matching `params` in one call.
 */
export class AccountsResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Account[]> {
    const env = await this.httpGet<AccountsEnvelope>(token, tenantId, "/Accounts", params, signal);
    return env.Accounts;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    accountId: string,
    signal?: AbortSignal,
  ): Promise<Account> {
    const env = await this.httpGet<AccountsEnvelope>(
      token,
      tenantId,
      this.idPath("Accounts", accountId),
      {},
      signal,
    );
    return first(env.Accounts);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    account: Account,
    signal?: AbortSignal,
  ): Promise<Account> {
    const env = await this.httpSend<AccountsEnvelope>(
      token,
      tenantId,
      "POST",
      "/Accounts",
      { Accounts: [account] },
      { signal },
    );
    return first(env.Accounts);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    accountId: string,
    account: Account,
    signal?: AbortSignal,
  ): Promise<Account> {
    const env = await this.httpSend<AccountsEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("Accounts", accountId),
      { Accounts: [account] },
      { signal },
    );
    return first(env.Accounts);
  }

  async delete(
    token: XeroToken,
    tenantId: string,
    accountId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(token, tenantId, "DELETE", this.idPath("Accounts", accountId), undefined, {
      signal,
    });
  }

  async getAttachments(
    token: XeroToken,
    tenantId: string,
    accountId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<AttachmentsEnvelope>(
      token,
      tenantId,
      `${this.idPath("Accounts", accountId)}/Attachments`,
      {},
      signal,
    );
    return env.Attachments;
  }
}
