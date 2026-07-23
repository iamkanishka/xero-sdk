/**
 * Demonstrates the standard OAuth 2.0 Authorization Code + PKCE flow:
 * print a URL for the user to visit, accept the resulting code on a
 * local callback server, exchange it for a token, list the tenants it
 * can access, and fetch that tenant's Invoices.
 *
 * Run with: npx tsx examples/authcode/index.ts
 */
import http from "node:http";
import { XeroClient, generatePkce } from "../../src/index.js";

async function main(): Promise<void> {
  const client = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    redirectUri: "http://localhost:8080/callback",
    scopes: ["offline_access", "accounting.transactions", "accounting.contacts", "accounting.settings"],
  });

  const pkce = await generatePkce();
  const authUrl = client.auth.authorizeUrl({ state: "demo-state", pkce });
  console.log("Visit this URL to authorize the app:");
  console.log(authUrl);

  const code = await new Promise<string>((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost:8080");
      const c = url.searchParams.get("code");
      res.end("Authorized! You can close this tab.");
      if (c) {
        server.close();
        resolve(c);
      }
    });
    server.listen(8080);
  });

  const token = await client.auth.exchangeCode(code, pkce.verifier);
  await client.saveToken("demo-user", token);

  const connections = await client.auth.connections(token);
  if (connections.length === 0) throw new Error("no tenants authorized");
  const tenantId = connections[0]!.tenantId;
  console.log(`Connected to tenant: ${connections[0]!.tenantName} (${tenantId})`);

  const invoices = await client.accounting.invoices.list(token, tenantId, { page: 1 });
  console.log(`Fetched ${invoices.length} invoices on page 1`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
