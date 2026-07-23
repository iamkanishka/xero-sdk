/**
 * Core entity types for Xero's Accounting API (api.xro/2.0) — the
 * largest and most-used surface of the platform.
 *
 * Date fields are typed `string` and left in Xero's raw wire format
 * (either `/Date(ms+tz)/` or plain `YYYY-MM-DD`, depending on
 * endpoint) rather than parsed into `Date` objects automatically —
 * see {@link parseXeroDate} / {@link formatXeroDate} in
 * `xero-sdk/dates` to convert. This avoids silently losing precision
 * or timezone information you might need, and keeps request payloads
 * byte-for-byte round-trippable.
 */

/** Escape hatch for sub-resources where full typing would add little value over a typed record. */
export type XeroObject = Record<string, unknown>;

export interface Address {
  AddressType?: "POBOX" | "STREET" | "DELIVERY" | string;
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
  AddressLine4?: string;
  City?: string;
  Region?: string;
  PostalCode?: string;
  Country?: string;
  AttentionTo?: string;
}

export interface Phone {
  PhoneType?: "DEFAULT" | "DDI" | "MOBILE" | "FAX" | string;
  PhoneNumber?: string;
  PhoneAreaCode?: string;
  PhoneCountryCode?: string;
}

export interface ContactPerson {
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  IncludeInEmails?: boolean;
}

export interface Contact {
  ContactID?: string;
  ContactNumber?: string;
  AccountNumber?: string;
  ContactStatus?: "ACTIVE" | "ARCHIVED" | "GDPRREQUEST" | string;
  Name?: string;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  SkypeUserName?: string;
  BankAccountDetails?: string;
  TaxNumber?: string;
  AccountsReceivableTaxType?: string;
  AccountsPayableTaxType?: string;
  Addresses?: Address[];
  Phones?: Phone[];
  IsSupplier?: boolean;
  IsCustomer?: boolean;
  DefaultCurrency?: string;
  ContactPersons?: ContactPerson[];
  UpdatedDateUTC?: string;
  ContactGroups?: XeroObject[];
  Website?: string;
  BrandingTheme?: XeroObject;
  BatchPayments?: XeroObject;
  Balances?: XeroObject;
  HasAttachments?: boolean;
  HasValidationErrors?: boolean;
}

export interface Account {
  AccountID?: string;
  Code?: string;
  Name?: string;
  Type?: string;
  BankAccountNumber?: string;
  Status?: "ACTIVE" | "ARCHIVED" | string;
  Description?: string;
  BankAccountType?: string;
  CurrencyCode?: string;
  TaxType?: string;
  EnablePaymentsToAccount?: boolean;
  ShowInExpenseClaims?: boolean;
  Class?: string;
  SystemAccount?: string;
  ReportingCode?: string;
  ReportingCodeName?: string;
  HasAttachments?: boolean;
  UpdatedDateUTC?: string;
  AddToWatchlist?: boolean;
}

export interface LineItem {
  LineItemID?: string;
  Description?: string;
  Quantity?: number;
  UnitAmount?: number;
  ItemCode?: string;
  AccountCode?: string;
  TaxType?: string;
  TaxAmount?: number;
  LineAmount?: number;
  Tracking?: XeroObject[];
  DiscountRate?: string;
}

export type InvoiceType = "ACCREC" | "ACCPAY";
export type InvoiceStatus = "DRAFT" | "SUBMITTED" | "AUTHORISED" | "PAID" | "VOIDED" | "DELETED";
export type LineAmountType = "Exclusive" | "Inclusive" | "NoTax";

export interface Invoice {
  InvoiceID?: string;
  InvoiceNumber?: string;
  Type?: InvoiceType | string;
  Contact?: Contact;
  LineItems?: LineItem[];
  Date?: string;
  DueDate?: string;
  Status?: InvoiceStatus | string;
  LineAmountTypes?: LineAmountType | string;
  SubTotal?: number;
  TotalTax?: number;
  Total?: number;
  AmountDue?: number;
  AmountPaid?: number;
  AmountCredited?: number;
  CurrencyCode?: string;
  CurrencyRate?: number;
  Reference?: string;
  BrandingThemeID?: string;
  Url?: string;
  SentToContact?: boolean;
  HasAttachments?: boolean;
  UpdatedDateUTC?: string;
  Payments?: XeroObject[];
  CreditNotes?: XeroObject[];
}

export interface CreditNote {
  CreditNoteID?: string;
  CreditNoteNumber?: string;
  Type?: "ACCRECCREDIT" | "ACCPAYCREDIT" | string;
  Contact?: Contact;
  LineItems?: LineItem[];
  Date?: string;
  Status?: string;
  LineAmountTypes?: LineAmountType | string;
  SubTotal?: number;
  TotalTax?: number;
  Total?: number;
  RemainingCredit?: number;
  CurrencyCode?: string;
  Reference?: string;
  UpdatedDateUTC?: string;
}

export interface Item {
  ItemID?: string;
  Code?: string;
  Name?: string;
  Description?: string;
  PurchaseDescription?: string;
  IsSold?: boolean;
  IsPurchased?: boolean;
  IsTrackedAsInventory?: boolean;
  InventoryAssetAccountCode?: string;
  QuantityOnHand?: number;
  SalesDetails?: XeroObject;
  PurchaseDetails?: XeroObject;
  UpdatedDateUTC?: string;
}

export interface Payment {
  PaymentID?: string;
  Invoice?: XeroObject;
  CreditNote?: XeroObject;
  Account?: XeroObject;
  Date?: string;
  Amount?: number;
  CurrencyRate?: number;
  PaymentType?: string;
  Status?: string;
  Reference?: string;
  IsReconciled?: boolean;
  UpdatedDateUTC?: string;
}

export interface PurchaseOrder {
  PurchaseOrderID?: string;
  PurchaseOrderNumber?: string;
  Contact?: Contact;
  LineItems?: LineItem[];
  Date?: string;
  DeliveryDate?: string;
  Status?: "DRAFT" | "SUBMITTED" | "AUTHORISED" | "BILLED" | "DELETED" | string;
  LineAmountTypes?: LineAmountType | string;
  SubTotal?: number;
  TotalTax?: number;
  Total?: number;
  Reference?: string;
  UpdatedDateUTC?: string;
}

export interface Quote {
  QuoteID?: string;
  QuoteNumber?: string;
  Contact?: Contact;
  LineItems?: LineItem[];
  Date?: string;
  ExpiryDate?: string;
  Status?: "DRAFT" | "SENT" | "DECLINED" | "ACCEPTED" | "INVOICED" | "DELETED" | string;
  LineAmountTypes?: LineAmountType | string;
  SubTotal?: number;
  TotalTax?: number;
  Total?: number;
  Reference?: string;
  Title?: string;
  Summary?: string;
  Terms?: string;
  UpdatedDateUTC?: string;
}

export interface ManualJournalLine {
  LineAmount?: number;
  AccountCode?: string;
  Description?: string;
  TaxType?: string;
  Tracking?: XeroObject[];
}

export interface ManualJournal {
  ManualJournalID?: string;
  Narration?: string;
  Date?: string;
  Status?: "DRAFT" | "POSTED" | "DELETED" | "VOIDED" | "ARCHIVED" | string;
  LineAmountTypes?: LineAmountType | string;
  JournalLines?: ManualJournalLine[];
  UpdatedDateUTC?: string;
  ShowOnCashBasisReports?: boolean;
}

export type BankTransactionType =
  | "RECEIVE"
  | "SPEND"
  | "RECEIVE-OVERPAYMENT"
  | "SPEND-OVERPAYMENT"
  | "RECEIVE-PREPAYMENT"
  | "SPEND-PREPAYMENT"
  | "RECEIVE-TRANSFER"
  | "SPEND-TRANSFER";

export interface BankTransaction {
  BankTransactionID?: string;
  Type?: BankTransactionType | string;
  Contact?: Contact;
  LineItems?: LineItem[];
  BankAccount?: XeroObject;
  IsReconciled?: boolean;
  Date?: string;
  Status?: "AUTHORISED" | "DELETED" | "VOIDED" | string;
  LineAmountTypes?: LineAmountType | string;
  Reference?: string;
  CurrencyCode?: string;
  Url?: string;
  SubTotal?: number;
  TotalTax?: number;
  Total?: number;
  UpdatedDateUTC?: string;
  HasAttachments?: boolean;
}

export interface BankTransfer {
  BankTransferID?: string;
  FromBankAccount?: XeroObject;
  ToBankAccount?: XeroObject;
  Amount?: number;
  Date?: string;
  CurrencyRate?: number;
  FromBankTransactionID?: string;
  ToBankTransactionID?: string;
  HasAttachments?: boolean;
  CreatedDateUTC?: string;
}

export interface ContactGroup {
  ContactGroupID?: string;
  Name?: string;
  Status?: "ACTIVE" | "DELETED" | string;
  Contacts?: Contact[];
}

export interface TrackingOption {
  TrackingOptionID?: string;
  Name?: string;
  Status?: string;
}

export interface TrackingCategory {
  TrackingCategoryID?: string;
  Name?: string;
  Status?: string;
  Options?: TrackingOption[];
}

export interface Organisation {
  OrganisationID?: string;
  Name?: string;
  LegalName?: string;
  ShortCode?: string;
  Version?: string;
  OrganisationType?: string;
  BaseCurrency?: string;
  CountryCode?: string;
  IsDemoCompany?: boolean;
  OrganisationStatus?: string;
  FinancialYearEndDay?: number;
  FinancialYearEndMonth?: number;
  SalesTaxBasis?: string;
  Timezone?: string;
  Addresses?: Address[];
  Phones?: Phone[];
}

export interface HistoryRecord {
  Changes?: string;
  DateUTC?: string;
  User?: string;
  Details?: string;
}

/** Generic report shape shared by every `/Reports/{ReportID}` endpoint. */
export interface Report {
  ReportID?: string;
  ReportName?: string;
  ReportType?: string;
  ReportTitles?: string[];
  ReportDate?: string;
  UpdatedDateUTC?: string;
  Fields?: XeroObject[];
  Rows?: XeroObject[];
}
