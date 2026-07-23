import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { Invoice, XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, collectAll, type FetchPageFn } from "../../pagination/index.js";
import { buildHeaders } from "../../http/index.js";

interface InvoicesEnvelope {
  Invoices: Invoice[];
}
interface AttachmentsEnvelope {
  Attachments: XeroObject[];
}

/** Sales (ACCREC) and purchase (ACCPAY) invoices/bills. */
export class InvoicesResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Invoice[]> {
    const env = await this.httpGet<InvoicesEnvelope>(token, tenantId, "/Invoices", params, signal);
    return env.Invoices;
  }

  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<Invoice, void, void> {
    const fetchPage: FetchPageFn<Invoice> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  listAll(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Invoice[]> {
    const fetchPage: FetchPageFn<Invoice> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return collectAll(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<Invoice> {
    const env = await this.httpGet<InvoicesEnvelope>(
      token,
      tenantId,
      this.idPath("Invoices", invoiceId),
      {},
      signal,
    );
    return first(env.Invoices);
  }

  /** Downloads the rendered PDF for an invoice as raw text (base64/binary content depending on runtime decoding needs — see README for streaming binary downloads). */
  async getAsPdf(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.httpGetPdf(
      token,
      tenantId,
      `${this.idPath("Invoices", invoiceId)}/pdf`,
      "/Invoices/{id}/pdf",
      signal,
    );
  }

  async create(
    token: XeroToken,
    tenantId: string,
    invoice: Invoice,
    options: { idempotencyKey?: string; signal?: AbortSignal } = {},
  ): Promise<Invoice> {
    const env = await this.httpSend<InvoicesEnvelope>(
      token,
      tenantId,
      "POST",
      "/Invoices",
      { Invoices: [invoice] },
      options,
    );
    return first(env.Invoices);
  }

  async createMany(
    token: XeroToken,
    tenantId: string,
    invoices: Invoice[],
    options: { idempotencyKey?: string; signal?: AbortSignal } = {},
  ): Promise<Invoice[]> {
    const env = await this.httpSend<InvoicesEnvelope>(
      token,
      tenantId,
      "POST",
      "/Invoices",
      { Invoices: invoices },
      options,
    );
    return env.Invoices;
  }

  async update(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    invoice: Invoice,
    signal?: AbortSignal,
  ): Promise<Invoice> {
    const env = await this.httpSend<InvoicesEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("Invoices", invoiceId),
      { Invoices: [invoice] },
      { signal },
    );
    return first(env.Invoices);
  }

  void(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<Invoice> {
    return this.update(
      token,
      tenantId,
      invoiceId,
      { InvoiceID: invoiceId, Status: "VOIDED" },
      signal,
    );
  }

  delete(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<Invoice> {
    return this.update(
      token,
      tenantId,
      invoiceId,
      { InvoiceID: invoiceId, Status: "DELETED" },
      signal,
    );
  }

  /** Triggers Xero to email the invoice to the contact using the default (or specified) branding theme template. */
  async email(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(
      token,
      tenantId,
      "POST",
      `${this.idPath("Invoices", invoiceId)}/Email`,
      {},
      { signal },
    );
  }

  /** Fetches the shareable "Online Invoice" URL for a sales invoice. */
  async onlineInvoiceUrl(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const env = await this.httpGet<{ OnlineInvoices: Array<{ OnlineInvoiceUrl: string }> }>(
      token,
      tenantId,
      `${this.idPath("Invoices", invoiceId)}/OnlineInvoice`,
      {},
      signal,
    );
    return env.OnlineInvoices[0]?.OnlineInvoiceUrl ?? "";
  }

  async listAttachments(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<AttachmentsEnvelope>(
      token,
      tenantId,
      `${this.idPath("Invoices", invoiceId)}/Attachments`,
      {},
      signal,
    );
    return env.Attachments;
  }

  /** Downloads a single named attachment's raw bytes as text. */
  async getAttachment(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    filename: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.httpGetPdf(
      token,
      tenantId,
      `${this.idPath("Invoices", invoiceId)}/Attachments/${encodeURIComponent(filename)}`,
      "/Invoices/{id}/Attachments/{filename}",
      signal,
    );
  }

  /** Uploads a new file attachment to an invoice. */
  async uploadAttachment(
    token: XeroToken,
    tenantId: string,
    invoiceId: string,
    filename: string,
    contentType: string,
    content: BodyInit,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const headers = buildHeaders(token, contentType);
    const response = await this.http.request({
      method: "POST",
      url: `${this.baseUrl}${this.idPath("Invoices", invoiceId)}/Attachments/${encodeURIComponent(filename)}`,
      logicalPath: "/Invoices/{id}/Attachments/{filename}",
      headers,
      body: content,
      tenantId,
      signal,
    });
    const env = JSON.parse(response.bodyText) as AttachmentsEnvelope;
    return first(env.Attachments);
  }
}
