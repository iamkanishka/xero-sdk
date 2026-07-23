/**
 * Demonstrates typed CRUD against the Accounting API using a token
 * that was already obtained and stored (see the authcode example for
 * how to get one), plus streaming pagination.
 *
 * Run with: npx tsx examples/invoices/index.ts
 */
import { XeroClient, FileTokenStore } from "../../src/index.js";

async function main(): Promise<void> {
  const store = await FileTokenStore.create(`${process.env.HOME}/.xero-sdk/tokens.json`);
  const client = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    store,
  });

  const token = await client.tokenFor("demo-user").catch(() => {
    throw new Error("no stored token — run the authcode example first");
  });
  const tenantId = process.env.XERO_TENANT_ID!;

  // Create a draft invoice.
  const invoice = await client.accounting.invoices.create(token, tenantId, {
    Type: "ACCREC",
    Contact: { Name: "Acme Widgets Ltd" },
    LineItems: [{ Description: "Consulting services", Quantity: 1, UnitAmount: 500, AccountCode: "200" }],
    Status: "DRAFT",
  });
  console.log(`Created invoice ${invoice.InvoiceID} (${invoice.InvoiceNumber})`);

  // Stream every AUTHORISED invoice without loading them all into memory at once.
  let count = 0;
  for await (const inv of client.accounting.invoices.stream(token, tenantId, { where: 'Status=="AUTHORISED"' })) {
    if (inv.InvoiceID) count++;
  }
  console.log(`Total AUTHORISED invoices: ${count}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
