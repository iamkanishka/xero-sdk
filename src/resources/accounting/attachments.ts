import { AccountingResourceBase, first } from "./base.js";
import type { XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { buildHeaders } from "../../http/index.js";
import { XeroError } from "../../errors/index.js";

/** Accounting entities that support the generic Attachments sub-resource. */
export const ATTACHABLE_RESOURCE_TYPES = new Set([
  "Accounts",
  "BankTransactions",
  "BankTransfers",
  "Contacts",
  "CreditNotes",
  "Invoices",
  "Items",
  "ManualJournals",
  "Overpayments",
  "Prepayments",
  "PurchaseOrders",
  "Quotes",
  "Receipts",
  "RepeatingInvoices",
]);

/** Generic file-attachment operations usable against any attachable Accounting resource. */
export class AttachmentsResource extends AccountingResourceBase {
  private assertAttachable(resource: string): void {
    if (!ATTACHABLE_RESOURCE_TYPES.has(resource)) {
      throw XeroError.configError(`"${resource}" is not a valid attachable resource type`);
    }
  }

  async list(
    token: XeroToken,
    tenantId: string,
    resource: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    this.assertAttachable(resource);
    const env = await this.httpGet<{ Attachments: XeroObject[] }>(
      token,
      tenantId,
      `${this.idPath(resource, id)}/Attachments`,
      {},
      signal,
    );
    return env.Attachments;
  }

  /** Downloads the raw bytes of a single named attachment, as text. */
  async download(
    token: XeroToken,
    tenantId: string,
    resource: string,
    id: string,
    filename: string,
    signal?: AbortSignal,
  ): Promise<string> {
    this.assertAttachable(resource);
    return this.httpGetPdf(
      token,
      tenantId,
      `${this.idPath(resource, id)}/Attachments/${encodeURIComponent(filename)}`,
      `/${resource}/{id}/Attachments/{filename}`,
      signal,
    );
  }

  async upload(
    token: XeroToken,
    tenantId: string,
    resource: string,
    id: string,
    filename: string,
    contentType: string,
    content: BodyInit,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    this.assertAttachable(resource);
    const headers = buildHeaders(token, contentType);
    const response = await this.http.request({
      method: "POST",
      url: `${this.baseUrl}${this.idPath(resource, id)}/Attachments/${encodeURIComponent(filename)}`,
      logicalPath: `/${resource}/{id}/Attachments/{filename}`,
      headers,
      body: content,
      tenantId,
      signal,
    });
    const env = JSON.parse(response.bodyText) as { Attachments: XeroObject[] };
    return first(env.Attachments);
  }
}
