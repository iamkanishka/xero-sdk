# Changelog

## v1.0.0 — 2026-07-23

Initial release.

- Full OAuth 2.0 support: Authorization Code + PKCE, Refresh Token (with rotation), Client Credentials, token revocation, `/connections` discovery.
- Accounting API (api.xro/2.0): Accounts, Contacts, Contact Groups, Invoices (incl. PDF/email/online-invoice-URL/attachments), Credit Notes, Bank Transactions, Bank Transfers, Overpayments, Prepayments, Repeating Invoices, Items, Payments, Batch Payments, Purchase Orders, Quotes, Manual Journals, (system) Journals, Linked Transactions, Tracking Categories, Organisation, Users, Tax Rates, Currencies, Branding Themes + Payment Services, Invoice Reminder Settings, generic Attachments/History/Notes across every attachable resource, and Reports (Balance Sheet, P&L, Trial Balance, Aged Receivables/Payables, Bank Summary, Budget Summary, Executive Summary, 1099, BAS, GST).
- Fixed Assets API (assets.xro/1.0): asset CRUD, disposal, asset types, depreciation schedules/runs.
- Files API (files.xro/1.0): files, folders, uploads/downloads, Inbox, object associations.
- Projects API (projects.xro/2.0): projects, tasks, time entries, non-time project items, assignable users.
- Bank Feeds API (bankfeeds.xro/1.0): connections, statements.
- Finance API (finance.xro/1.0): bank statements, cash validation, financial statements, activity reports.
- Practice Manager API (practicemanager/3.1): jobs, job notes, job costs, clients, staff, time, tasks, categories, templates, invoice export — modeled as the XML/`.api` protocol it actually is, not pretend-JSON.
- App Store partner API (appstore/2.0): subscriptions, usage records.
- eInvoicing API (einvoicing.xro/1.0): PEPPOL participant lookup, document exchange.
- Payroll AU, NZ, and UK: employees, pay runs, payslips, timesheets, leave, pay items/earnings rates, settings.
- Client-side rate limiting matching Xero's published per-tenant limits, self-correcting from response headers.
- Automatic retry with exponential backoff + jitter (Web Crypto-sourced) on 429/5xx/network errors.
- Async-generator pagination (`stream`/`listAll`/`collectAll`/`forEachPage`).
- `AbortSignal` support throughout every method.
- Pluggable `TokenStore` (`MemoryTokenStore`, `FileTokenStore` included).
- Dependency-free `XeroObserver` telemetry hook.
- Zero runtime dependencies — native `fetch` + Web Crypto only. Dual ESM/CJS build with full type declarations.

### Design notes for downstream consumers

- The Accounting domain is fully typed (see README's scope note); the other nine domains use a `Record<string, unknown>` escape hatch (`XeroObject`) per-domain, matching the same trade-off made in `xero-go`.
- Every endpoint path, HTTP verb, and request/response envelope shape was cross-checked against a reference implementation rather than inferred from REST convention. Several corrections were non-obvious (Finance API's mixed-case paths, Payroll AU surfacing leave types via `/PayItems` instead of a dedicated route, NZ/UK's `StatutoryLeaves` pluralization, Practice Manager's XML wire format) and would only have surfaced as runtime 404s otherwise.
