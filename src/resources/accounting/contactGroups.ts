import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { ContactGroup, Contact } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

interface Envelope {
  ContactGroups: ContactGroup[];
}

export class ContactGroupsResource extends AccountingResourceBase {
  async list(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<ContactGroup[]> {
    const env = await this.httpGet<Envelope>(token, tenantId, "/ContactGroups", params, signal);
    return env.ContactGroups;
  }

  async get(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<ContactGroup> {
    const env = await this.httpGet<Envelope>(
      token,
      tenantId,
      this.idPath("ContactGroups", id),
      {},
      signal,
    );
    return first(env.ContactGroups);
  }

  async create(
    token: XeroToken,
    tenantId: string,
    name: string,
    signal?: AbortSignal,
  ): Promise<ContactGroup> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "PUT",
      "/ContactGroups",
      { ContactGroups: [{ Name: name }] },
      { signal },
    );
    return first(env.ContactGroups);
  }

  async update(
    token: XeroToken,
    tenantId: string,
    id: string,
    name: string,
    signal?: AbortSignal,
  ): Promise<ContactGroup> {
    const env = await this.httpSend<Envelope>(
      token,
      tenantId,
      "POST",
      this.idPath("ContactGroups", id),
      { ContactGroups: [{ ContactGroupID: id, Name: name }] },
      { signal },
    );
    return first(env.ContactGroups);
  }

  async addContacts(
    token: XeroToken,
    tenantId: string,
    groupId: string,
    contactIds: string[],
    signal?: AbortSignal,
  ): Promise<Contact[]> {
    const contacts = contactIds.map((ContactID) => ({ ContactID }));
    const env = await this.httpSend<{ Contacts: Contact[] }>(
      token,
      tenantId,
      "PUT",
      `${this.idPath("ContactGroups", groupId)}/Contacts`,
      { Contacts: contacts },
      { signal },
    );
    return env.Contacts;
  }

  async removeContact(
    token: XeroToken,
    tenantId: string,
    groupId: string,
    contactId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(
      token,
      tenantId,
      "DELETE",
      `${this.idPath("ContactGroups", groupId)}/Contacts/${contactId}`,
      undefined,
      { signal },
    );
  }

  async removeAllContacts(
    token: XeroToken,
    tenantId: string,
    groupId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(
      token,
      tenantId,
      "DELETE",
      `${this.idPath("ContactGroups", groupId)}/Contacts`,
      undefined,
      { signal },
    );
  }

  async delete(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(token, tenantId, "DELETE", this.idPath("ContactGroups", id), undefined, {
      signal,
    });
  }
}
