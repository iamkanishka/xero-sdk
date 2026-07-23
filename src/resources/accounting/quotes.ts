import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { Quote } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, type FetchPageFn } from "../../pagination/index.js";

interface QuotesEnvelope {
  Quotes: Quote[];
}

export class QuotesResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Quote[]> {
    const env = await this.httpGet<QuotesEnvelope>(token, tenantId, "/Quotes", params, signal);
    return env.Quotes;
  }

  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<Quote, void, void> {
    const fetchPage: FetchPageFn<Quote> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    quoteId: string,
    signal?: AbortSignal,
  ): Promise<Quote> {
    const env = await this.httpGet<QuotesEnvelope>(
      token,
      tenantId,
      this.idPath("Quotes", quoteId),
      {},
      signal,
    );
    return first(env.Quotes);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    quote: Quote,
    signal?: AbortSignal,
  ): Promise<Quote> {
    const env = await this.httpSend<QuotesEnvelope>(
      token,
      tenantId,
      "POST",
      "/Quotes",
      { Quotes: [quote] },
      { signal },
    );
    return first(env.Quotes);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    quoteId: string,
    quote: Quote,
    signal?: AbortSignal,
  ): Promise<Quote> {
    const env = await this.httpSend<QuotesEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("Quotes", quoteId),
      { Quotes: [quote] },
      { signal },
    );
    return first(env.Quotes);
  }

  delete(
    token: XeroToken,
    tenantId: string,
    quoteId: string,
    signal?: AbortSignal,
  ): Promise<Quote> {
    return this.update(token, tenantId, quoteId, { QuoteID: quoteId, Status: "DELETED" }, signal);
  }

  getAsPdf(
    token: XeroToken,
    tenantId: string,
    quoteId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.httpGetPdf(
      token,
      tenantId,
      `${this.idPath("Quotes", quoteId)}/pdf`,
      "/Quotes/{id}/pdf",
      signal,
    );
  }
}
