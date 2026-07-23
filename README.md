# xero-sdk

A production-grade, **dependency-free** TypeScript SDK for the entire [Xero](https://developer.xero.com) API platform — Accounting, Assets, Files, Projects, Bank Feeds, Finance, Practice Manager, App Store, eInvoicing, and Payroll (AU/NZ/UK).

A companion to [`xero-go`](https://github.com/iamkanishka/xero-go) (Go) and the `xero` Elixir hex package, applying the same coverage and design principles to idiomatic modern TypeScript.

## Design

- **Zero runtime dependencies.** Built entirely on native `fetch` and the Web Crypto API — works in Node.js ≥ 18.17, Deno, Bun, Cloudflare Workers, and browsers alike. Nothing to audit in your lockfile, nothing to break on someone else's release schedule.
- **Dual ESM/CJS build** with full type declarations, via `tsup`. `import` and `require` both work.
- **Resource-namespaced API**, idiomatic for TS SDKs: `client.accounting.invoices.list(...)`, `client.accounting.contacts.get(...)`, `client.payrollAu.listEmployees(...)`.
- **One error class.** Every call rejects with a single `XeroError` (or resolves) — never a bare `fetch` error. Switch on `.type` (`"not_found"`, `"rate_limited"`, `"unprocessable"`, ...) or `instanceof XeroError`.
- **Client-side rate limiting** that mirrors Xero's published limits (60/min, 5,000/day per tenant), self-correcting from the `X-DayLimit-Remaining` / `X-MinLimit-Remaining` response headers so it never drifts from server-side truth.
- **Automatic retry with exponential backoff + jitter** (sourced from Web Crypto, not `Math.random()`) on 429/5xx/network errors, honoring `Retry-After`.
- **`AbortSignal` support throughout** — every method accepts an optional signal for cancellation, composed with the SDK's own per-request timeout.
- **Async-generator pagination** (`stream()` / `for await`) alongside eager `listAll()` / `collectAll()` helpers — walk millions of Invoices without buffering them all in memory.
- **Pluggable token storage.** Ships with `MemoryTokenStore` and a Node.js `FileTokenStore`; implement the 4-method `TokenStore` interface against Redis/Postgres/anything for production multi-instance deployments.
- **Dependency-free telemetry.** A small `XeroObserver` interface receives request/rate-limit/refresh events — adapt to OpenTelemetry, Prometheus, or your logger yourself; the SDK doesn't force a tracing library on you.

## Scope note: typed entities vs. flexible objects

The **Accounting API** — by far the largest and most-used surface — has full, hand-modeled TypeScript interfaces for its core entities (`Account`, `Contact`, `Invoice`, `CreditNote`, `Item`, `Payment`, `PurchaseOrder`, `Quote`, `ManualJournal`, `BankTransaction`, `BankTransfer`, `TrackingCategory`, `ContactGroup`, `Organisation`, `HistoryRecord`) and covers every resource in the API — 24 resource modules, 170+ methods.

The nine remaining APIs (Assets, Files, Projects, Bank Feeds, Finance, App Store, eInvoicing, and the three Payroll regions) are intentionally modeled with a `Record<string, unknown>` escape hatch (`XeroObject`) rather than exhaustive interfaces for every sub-resource, given the size of Xero's total surface. Every method signature, HTTP verb, and endpoint path is real and matches Xero's published API reference — verified endpoint-by-endpoint against a reference implementation, not guessed — but request/response *shapes* for these smaller APIs are flexible JSON rather than rigid types. You can always narrow a result yourself:

```ts
interface MyAsset { AssetId: string; AssetName: string; /* ... */ }
const asset = (await client.assets.get(token, tenantId, id)) as unknown as MyAsset;
```

**Practice Manager is a special case.** Unlike every other Xero API, Practice Manager (`practicemanager/3.1`) uses singular `.api`-suffixed endpoints (`/job.api`, `/client.api`, ...) that take identifiers as query parameters rather than path segments, and it **always returns raw XML**, never JSON, regardless of request headers. `client.practiceManager` reflects this faithfully — every method takes a `Record<string, string>` of query filters and resolves with raw XML text for you to parse with your XML library of choice, rather than pretending it's a JSON API like the rest of the SDK.

## Install

```bash
npm install xero-sdk
```

Requires Node.js ≥ 18.17 (for native `fetch`), or any runtime with `fetch` + Web Crypto (Deno, Bun, Cloudflare Workers, modern browsers).

## Quick start

```ts
import { XeroClient, generatePkce } from "xero-sdk";

const client = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET,
  redirectUri: "https://myapp.example.com/callback",
  scopes: ["offline_access", "accounting.transactions", "accounting.contacts"],
});

// 1. Send the user to authorize your app.
const pkce = await generatePkce();
const authUrl = client.auth.authorizeUrl({ state: "xyz", pkce });

// 2. Exchange the code from your redirect handler for a token.
const token = await client.auth.exchangeCode(code, pkce.verifier);

// 3. Discover which tenant(s) this token can access.
const [connection] = await client.auth.connections(token);
const tenantId = connection.tenantId;

// 4. Call any API.
const invoices = await client.accounting.invoices.list(token, tenantId, {
  where: 'Status=="AUTHORISED"',
  order: "Date DESC",
});

// 5. Stream every page without loading them all into memory.
for await (const invoice of client.accounting.invoices.stream(token, tenantId)) {
  console.log(invoice.InvoiceNumber, invoice.Total);
}
```

See `examples/` for complete, runnable programs: `authcode` (full OAuth flow with a local callback server), `clientcredentials` (App Store partner API), `invoices` (typed CRUD + streaming with a persisted token), and `streaming` (walking every Contact with a custom telemetry observer). Run any of them with [`tsx`](https://github.com/privatenumber/tsx): `npx tsx examples/authcode/index.ts`.

## Error handling

```ts
import { XeroError } from "xero-sdk";

try {
  await client.accounting.invoices.get(token, tenantId, invoiceId);
} catch (err) {
  if (err instanceof XeroError) {
    switch (err.type) {
      case "not_found":
        // handle 404
        break;
      case "rate_limited":
        // already retried automatically; this means retries were exhausted
        break;
      case "unprocessable":
        // err.detail?.Elements?.[0]?.ValidationErrors has the specifics
        break;
    }
  }
}
```

## Long-running services: token refresh

```ts
import { XeroClient, FileTokenStore } from "xero-sdk";

const store = await FileTokenStore.create("/var/lib/myapp/tokens.json"); // or implement TokenStore against your DB
const client = new XeroClient({ ...config, store });

await client.saveToken("user-42", token); // after initial OAuth exchange

// On every subsequent request, just:
const token = await client.tokenFor("user-42"); // auto-refreshes + persists if within 2 minutes of expiry
```

## Cancellation

Every method accepts a trailing (or options-bag) `AbortSignal`:

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

const invoices = await client.accounting.invoices.list(token, tenantId, {}, controller.signal);
```

## Testing

```bash
npm run typecheck   # tsc --noEmit across src + test + examples
npm run lint        # eslint (typed rules)
npm run format:check
npm test            # vitest
npm run build       # tsup — dual ESM/CJS + .d.ts
```

The full suite runs against a minimal mock `fetch` — no live Xero credentials required. 58 tests cover retry/backoff behavior, structured error mapping, rate-limit header reconciliation, OAuth code/refresh/client-credentials flows, PKCE generation, token store persistence (including concurrent-write safety), pagination correctness, and Accounting envelope (de)serialization.

## Browser usage

The SDK works in browsers as-is (native `fetch` + Web Crypto), but you should **never** put a `clientSecret` in client-side code. For browser/SPA usage, configure a PKCE-only public client (omit `clientSecret`) and exchange the authorization code from a backend you control, or use the SDK purely for the token-authenticated API calls after obtaining a token server-side.

## License

MIT — see [LICENSE](LICENSE).
