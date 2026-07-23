import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { Payment, XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, type FetchPageFn } from "../../pagination/index.js";

interface PaymentsEnvelope {
  Payments: Payment[];
}

export class PaymentsResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Payment[]> {
    const env = await this.httpGet<PaymentsEnvelope>(token, tenantId, "/Payments", params, signal);
    return env.Payments;
  }

  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<Payment, void, void> {
    const fetchPage: FetchPageFn<Payment> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    paymentId: string,
    signal?: AbortSignal,
  ): Promise<Payment> {
    const env = await this.httpGet<PaymentsEnvelope>(
      token,
      tenantId,
      this.idPath("Payments", paymentId),
      {},
      signal,
    );
    return first(env.Payments);
  }

  /** Applies a payment to an invoice/credit note/prepayment/overpayment. */
  async create(
    token: XeroToken,
    tenantId: string,
    payment: Payment,
    signal?: AbortSignal,
  ): Promise<Payment> {
    const env = await this.httpSend<PaymentsEnvelope>(
      token,
      tenantId,
      "PUT",
      "/Payments",
      { Payments: [payment] },
      { signal },
    );
    return first(env.Payments);
  }

  async createMany(
    token: XeroToken,
    tenantId: string,
    payments: Payment[],
    signal?: AbortSignal,
  ): Promise<Payment[]> {
    const env = await this.httpSend<PaymentsEnvelope>(
      token,
      tenantId,
      "PUT",
      "/Payments",
      { Payments: payments },
      { signal },
    );
    return env.Payments;
  }

  /** Reverses (deletes) a payment. */
  async delete(
    token: XeroToken,
    tenantId: string,
    paymentId: string,
    signal?: AbortSignal,
  ): Promise<Payment> {
    const env = await this.httpSend<PaymentsEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("Payments", paymentId),
      { Payments: [{ PaymentID: paymentId, Status: "DELETED" }] },
      { signal },
    );
    return first(env.Payments);
  }

  async createBatchPayment(
    token: XeroToken,
    tenantId: string,
    batch: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ BatchPayments: XeroObject[] }>(
      token,
      tenantId,
      "PUT",
      "/BatchPayments",
      { BatchPayments: [batch] },
      { signal },
    );
    return first(env.BatchPayments);
  }

  async listBatchPayments(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ BatchPayments: XeroObject[] }>(
      token,
      tenantId,
      "/BatchPayments",
      params,
      signal,
    );
    return env.BatchPayments;
  }
}
