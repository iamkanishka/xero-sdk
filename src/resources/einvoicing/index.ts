import type { HttpClient } from "../../http/HttpClient.js";
import { getJson, sendJson, requestRaw, type RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";

export type XeroObject = Record<string, unknown>;

export interface DocumentListParams {
  /** OUTBOUND | INBOUND */
  direction?: string;
  /** SENT | DELIVERED | FAILED | REJECTED */
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

function toQuery(params: DocumentListParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.direction) q.set("Direction", params.direction);
  if (params.status) q.set("Status", params.status);
  if (params.dateFrom) q.set("DateFrom", params.dateFrom);
  if (params.dateTo) q.set("DateTo", params.dateTo);
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  return q;
}

/** eInvoicing API (einvoicing.xro/1.0): PEPPOL participant lookup and eInvoice document exchange. */
export class EInvoicingClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
  ) {}

  /** Checks whether a given identifier is registered on the PEPPOL network as an eInvoicing-capable participant. */
  lookupParticipant(
    token: XeroToken,
    tenantId: string,
    participantId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    const q = new URLSearchParams({ participantId });
    return getJson(this.http, this.baseUrl, "/documents/Participants", token, q, {
      ...options,
      tenantId,
    });
  }

  /** Returns this organisation's own PEPPOL participant details. */
  getOrganisationParticipant(
    token: XeroToken,
    tenantId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(
      this.http,
      this.baseUrl,
      "/documents/Participants/Organisation",
      token,
      undefined,
      { ...options, tenantId },
    );
  }

  async listDocuments(
    token: XeroToken,
    tenantId: string,
    params: DocumentListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await getJson<{ documents: XeroObject[] }>(
      this.http,
      this.baseUrl,
      "/documents",
      token,
      toQuery(params),
      { ...options, tenantId },
    );
    return env.documents;
  }

  getDocument(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/documents/${id}`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  getDocumentStatus(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return getJson(this.http, this.baseUrl, `/documents/${id}/status`, token, undefined, {
      ...options,
      tenantId,
    });
  }

  /** Transmits a new eInvoicing document over the PEPPOL network. */
  sendDocument(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", "/documents", token, attrs, {
      ...options,
      tenantId,
    });
  }

  /** Downloads the raw (typically UBL XML) document content. */
  async downloadDocument(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<string> {
    const response = await requestRaw(
      this.http,
      this.baseUrl,
      "GET",
      `/documents/${id}/content`,
      token,
      { ...options, tenantId },
    );
    return response.bodyText;
  }

  /** Confirms receipt of an inbound document. */
  acknowledgeDocument(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(
      this.http,
      this.baseUrl,
      "POST",
      `/documents/${id}/Acknowledge`,
      token,
      {},
      { ...options, tenantId },
    );
  }

  /** Rejects an inbound document with a reason. `attrs` should include `rejectReason` and `rejectDescription`. */
  rejectDocument(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return sendJson(this.http, this.baseUrl, "POST", `/documents/${id}/Reject`, token, attrs, {
      ...options,
      tenantId,
    });
  }
}
