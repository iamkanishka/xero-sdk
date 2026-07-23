import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { BankTransaction } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, type FetchPageFn } from "../../pagination/index.js";

interface Envelope {
  BankTransactions: BankTransaction[];
}

/** Spend/receive money transactions — distinct from Invoices/Bills, used for transactions outside the AR/AP workflow. */
export class BankTransactionsResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<BankTransaction[]> {
    const env = await this.httpGet<Envelope>(token, tenantId, "/BankTransactions", params, signal);
    return env.BankTransactions;
  }

  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<BankTransaction, void, void> {
    const fetchPage: FetchPageFn<BankTransaction> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<BankTransaction> {
    const env = await this.httpGet<Envelope>(
      token,
      tenantId,
      this.idPath("BankTransactions", id),
      {},
      signal,
    );
    return first(env.BankTransactions);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    tx: BankTransaction,
    signal?: AbortSignal,
  ): Promise<BankTransaction> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "PUT",
      "/BankTransactions",
      { BankTransactions: [tx] },
      { signal },
    );
    return first(env.BankTransactions);
  }

  async createMany(
    token: XeroToken,
    tenantId: string,
    txs: BankTransaction[],
    signal?: AbortSignal,
  ): Promise<BankTransaction[]> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "PUT",
      "/BankTransactions",
      { BankTransactions: txs },
      { signal },
    );
    return env.BankTransactions;
  }

  async update(
    token: XeroToken,
    tenantId: string,
    id: string,
    tx: BankTransaction,
    signal?: AbortSignal,
  ): Promise<BankTransaction> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "POST",
      this.idPath("BankTransactions", id),
      { BankTransactions: [tx] },
      { signal },
    );
    return first(env.BankTransactions);
  }

  delete(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<BankTransaction> {
    return this.update(token, tenantId, id, { BankTransactionID: id, Status: "DELETED" }, signal);
  }
}
