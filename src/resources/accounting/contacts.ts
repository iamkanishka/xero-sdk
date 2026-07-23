import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { Contact, XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";
import { paginate, collectAll, type FetchPageFn } from "../../pagination/index.js";

interface ContactsEnvelope {
  Contacts: Contact[];
}

/** Customers and suppliers. */
export class ContactsResource extends AccountingResourceBase {
  /** A single page (up to 100) of contacts. Use {@link stream} or {@link listAll} to walk every page. */
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Contact[]> {
    const env = await this.httpGet<ContactsEnvelope>(token, tenantId, "/Contacts", params, signal);
    return env.Contacts;
  }

  /** Lazily async-iterates every contact matching `params`, fetching additional pages on demand. */
  stream(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): AsyncGenerator<Contact, void, void> {
    const fetchPage: FetchPageFn<Contact> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return paginate(fetchPage, signal);
  }

  /** Eagerly fetches and concatenates every page. */
  listAll(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<Contact[]> {
    const fetchPage: FetchPageFn<Contact> = (page) =>
      this.list(token, tenantId, { ...params, page }, signal);
    return collectAll(fetchPage, signal);
  }

  async get(
    token: XeroToken,
    tenantId: string,
    contactId: string,
    signal?: AbortSignal,
  ): Promise<Contact> {
    const env = await this.httpGet<ContactsEnvelope>(
      token,
      tenantId,
      this.idPath("Contacts", contactId),
      {},
      signal,
    );
    return first(env.Contacts);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    contact: Contact,
    signal?: AbortSignal,
  ): Promise<Contact> {
    const env = await this.httpSend<ContactsEnvelope>(
      token,
      tenantId,
      "PUT",
      "/Contacts",
      { Contacts: [contact] },
      { signal },
    );
    return first(env.Contacts);
  }

  /** Creates multiple contacts in a single batched call. */
  async createMany(
    token: XeroToken,
    tenantId: string,
    contacts: Contact[],
    signal?: AbortSignal,
  ): Promise<Contact[]> {
    const env = await this.httpSend<ContactsEnvelope>(
      token,
      tenantId,
      "PUT",
      "/Contacts",
      { Contacts: contacts },
      { signal },
    );
    return env.Contacts;
  }

  async update(
    token: XeroToken,
    tenantId: string,
    contactId: string,
    contact: Contact,
    signal?: AbortSignal,
  ): Promise<Contact> {
    const env = await this.httpSend<ContactsEnvelope>(
      token,
      tenantId,
      "POST",
      this.idPath("Contacts", contactId),
      { Contacts: [contact] },
      { signal },
    );
    return first(env.Contacts);
  }

  /** Sets a contact's status to ARCHIVED (Xero has no hard delete for contacts with any transaction history). */
  archive(
    token: XeroToken,
    tenantId: string,
    contactId: string,
    signal?: AbortSignal,
  ): Promise<Contact> {
    return this.update(
      token,
      tenantId,
      contactId,
      { ContactID: contactId, ContactStatus: "ARCHIVED" },
      signal,
    );
  }

  async getCisSettings(
    token: XeroToken,
    tenantId: string,
    contactId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<{ CISSettings: XeroObject[] }>(
      token,
      tenantId,
      `${this.idPath("Contacts", contactId)}/CISSettings`,
      {},
      signal,
    );
    return first(env.CISSettings);
  }

  async updateCisSettings(
    token: XeroToken,
    tenantId: string,
    contactId: string,
    attrs: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ CISSettings: XeroObject[] }>(
      token,
      tenantId,
      "POST",
      `${this.idPath("Contacts", contactId)}/CISSettings`,
      attrs,
      { signal },
    );
    return first(env.CISSettings);
  }
}
