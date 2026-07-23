import type { HttpClient } from "../../http/HttpClient.js";
import { AccountsResource } from "./accounts.js";
import { ContactsResource } from "./contacts.js";
import { InvoicesResource } from "./invoices.js";
import { CreditNotesResource } from "./creditNotes.js";
import { ItemsResource } from "./items.js";
import { PaymentsResource } from "./payments.js";
import { PurchaseOrdersResource } from "./purchaseOrders.js";
import { QuotesResource } from "./quotes.js";
import { ManualJournalsResource } from "./manualJournals.js";
import { BankTransactionsResource } from "./bankTransactions.js";
import { BankTransfersResource } from "./bankTransfers.js";
import { OverpaymentsResource, PrepaymentsResource } from "./overpaymentsPrepayments.js";
import { RepeatingInvoicesResource } from "./repeatingInvoices.js";
import { LinkedTransactionsResource } from "./linkedTransactions.js";
import { JournalsResource } from "./journals.js";
import { TrackingCategoriesResource } from "./trackingCategories.js";
import { ContactGroupsResource } from "./contactGroups.js";
import { OrganisationResource } from "./organisation.js";
import { UsersResource } from "./users.js";
import { HistoryResource } from "./history.js";
import { AttachmentsResource } from "./attachments.js";
import { ReportsResource } from "./reports.js";

/**
 * The Accounting API (api.xro/2.0) — the largest and most-used surface
 * of the Xero platform. Every resource is namespaced as a property, so
 * calls read as `client.accounting.invoices.list(token, tenantId)`,
 * `client.accounting.contacts.get(token, tenantId, contactId)`, etc.
 */
export class AccountingClient {
  readonly accounts: AccountsResource;
  readonly contacts: ContactsResource;
  readonly invoices: InvoicesResource;
  readonly creditNotes: CreditNotesResource;
  readonly items: ItemsResource;
  readonly payments: PaymentsResource;
  readonly purchaseOrders: PurchaseOrdersResource;
  readonly quotes: QuotesResource;
  readonly manualJournals: ManualJournalsResource;
  readonly bankTransactions: BankTransactionsResource;
  readonly bankTransfers: BankTransfersResource;
  readonly overpayments: OverpaymentsResource;
  readonly prepayments: PrepaymentsResource;
  readonly repeatingInvoices: RepeatingInvoicesResource;
  readonly linkedTransactions: LinkedTransactionsResource;
  readonly journals: JournalsResource;
  readonly trackingCategories: TrackingCategoriesResource;
  readonly contactGroups: ContactGroupsResource;
  readonly organisation: OrganisationResource;
  readonly users: UsersResource;
  readonly history: HistoryResource;
  readonly attachments: AttachmentsResource;
  readonly reports: ReportsResource;

  constructor(http: HttpClient, baseUrl: string) {
    this.accounts = new AccountsResource(http, baseUrl);
    this.contacts = new ContactsResource(http, baseUrl);
    this.invoices = new InvoicesResource(http, baseUrl);
    this.creditNotes = new CreditNotesResource(http, baseUrl);
    this.items = new ItemsResource(http, baseUrl);
    this.payments = new PaymentsResource(http, baseUrl);
    this.purchaseOrders = new PurchaseOrdersResource(http, baseUrl);
    this.quotes = new QuotesResource(http, baseUrl);
    this.manualJournals = new ManualJournalsResource(http, baseUrl);
    this.bankTransactions = new BankTransactionsResource(http, baseUrl);
    this.bankTransfers = new BankTransfersResource(http, baseUrl);
    this.overpayments = new OverpaymentsResource(http, baseUrl);
    this.prepayments = new PrepaymentsResource(http, baseUrl);
    this.repeatingInvoices = new RepeatingInvoicesResource(http, baseUrl);
    this.linkedTransactions = new LinkedTransactionsResource(http, baseUrl);
    this.journals = new JournalsResource(http, baseUrl);
    this.trackingCategories = new TrackingCategoriesResource(http, baseUrl);
    this.contactGroups = new ContactGroupsResource(http, baseUrl);
    this.organisation = new OrganisationResource(http, baseUrl);
    this.users = new UsersResource(http, baseUrl);
    this.history = new HistoryResource(http, baseUrl);
    this.attachments = new AttachmentsResource(http, baseUrl);
    this.reports = new ReportsResource(http, baseUrl);
  }
}

export * from "./types.js";
export type { ListParams } from "./base.js";
export type { JournalParams } from "./journals.js";
export type { ReportParams } from "./reports.js";
export { ATTACHABLE_RESOURCE_TYPES } from "./attachments.js";
