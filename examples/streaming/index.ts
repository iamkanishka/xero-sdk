/**
 * Demonstrates walking every Contact across every page with
 * forEachPage, and observing SDK-level telemetry via a custom
 * Observer.
 *
 * Run with: npx tsx examples/streaming/index.ts
 */
import {
  XeroClient,
  FileTokenStore,
  forEachPage,
  type XeroObserver,
  type RequestEvent,
  type RateLimitEvent,
} from "../../src/index.js";

const logObserver: XeroObserver = {
  onRequest(e: RequestEvent) {
    console.log(
      `[xero] ${e.method} ${e.path} -> ${e.status} in ${e.durationMs.toFixed(0)}ms (attempt ${e.attempt})`,
    );
  },
  onRateLimit(e: RateLimitEvent) {
    console.log(
      `[xero] tenant=${e.tenantId} day-remaining=${e.dayRemaining} min-remaining=${e.minRemaining}`,
    );
  },
  onTokenRefreshed(key: string) {
    console.log(`[xero] token refreshed: ${key}`);
  },
  onTokenRefreshFailed(key: string, err: unknown) {
    console.log(`[xero] token refresh failed for ${key}: ${String(err)}`);
  },
};

async function main(): Promise<void> {
  const store = await FileTokenStore.create(`${process.env.HOME}/.xero-sdk/tokens.json`);
  const client = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    store,
    observer: logObserver,
  });

  const token = await client.tokenFor("demo-user");
  const tenantId = process.env.XERO_TENANT_ID!;

  await forEachPage(
    (page) => client.accounting.contacts.list(token, tenantId, { page }),
    (contact) => {
      console.log(`- ${contact.Name} (${contact.ContactID})`);
    },
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
