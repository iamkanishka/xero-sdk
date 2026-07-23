/**
 * Demonstrates the OAuth 2.0 Client Credentials grant used by App
 * Store partner apps (no user/tenant context) to list subscriptions
 * and post metered usage records.
 *
 * Run with: npx tsx examples/clientcredentials/index.ts
 */
import { XeroClient } from "../../src/index.js";

async function main(): Promise<void> {
  const client = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
  });

  const token = await client.auth.clientCredentialsToken(["marketplace.billing"]);
  const subscriptions = await client.appStore.listSubscriptions(token);
  console.log(`Found ${subscriptions.length} subscriptions`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
