import { describe, it, expect } from "vitest";
import { AccountingClient } from "../src/resources/accounting/index.js";
import { HttpClient } from "../src/http/HttpClient.js";
import { RateLimiter } from "../src/http/RateLimiter.js";
import { noopObserver } from "../src/telemetry/index.js";
import { resolveConfig } from "../src/config.js";
import type { XeroToken } from "../src/auth/Token.js";
import { createMockFetch, jsonResponse } from "./helpers/mockFetch.js";

const testToken: XeroToken = {
  accessToken: "AT",
  refreshToken: "",
  tokenType: "Bearer",
  scopes: [],
  obtainedAt: 0,
  expiresAt: 0,
};

const BASE_URL = "https://api.example.com/api.xro/2.0";

function makeAccounting(fetchImpl: typeof fetch): AccountingClient {
  const config = resolveConfig({ clientId: "test", fetch: fetchImpl });
  const http = new HttpClient(config, new RateLimiter(), noopObserver);
  return new AccountingClient(http, BASE_URL);
}

describe("AccountingClient.invoices", () => {
  it("list() parses the envelope and sends auth/tenant headers", async () => {
    const fetchImpl = createMockFetch((url, init) => {
      const headers = new Headers(init.headers);
      expect(headers.get("Authorization")).toBe("Bearer AT");
      expect(headers.get("Xero-Tenant-Id")).toBe("tenant-1");
      expect(url).toContain("/Invoices");
      return jsonResponse({
        Invoices: [
          { InvoiceID: "inv-1", InvoiceNumber: "INV-0001", Type: "ACCREC", Status: "AUTHORISED" },
        ],
      });
    });
    const accounting = makeAccounting(fetchImpl);

    const invoices = await accounting.invoices.list(testToken, "tenant-1");
    expect(invoices).toHaveLength(1);
    expect(invoices[0]?.InvoiceID).toBe("inv-1");
  });

  it("get() maps a 404 to a XeroError", async () => {
    const fetchImpl = createMockFetch(() => new Response("", { status: 404 }));
    const accounting = makeAccounting(fetchImpl);

    await expect(
      accounting.invoices.get(testToken, "tenant-1", "missing-id"),
    ).rejects.toMatchObject({
      type: "not_found",
    });
  });

  it("listAll() collects across multiple pages", async () => {
    let page = 0;
    const fetchImpl = createMockFetch(() => {
      page++;
      const count = page === 1 ? 100 : 1;
      const invoices = Array.from({ length: count }, () => ({ InvoiceID: `inv-${page}` }));
      return jsonResponse({ Invoices: invoices });
    });
    const accounting = makeAccounting(fetchImpl);

    const all = await accounting.invoices.listAll(testToken, "tenant-1");
    expect(all).toHaveLength(101);
  });

  it("stream() lazily async-iterates", async () => {
    let page = 0;
    const fetchImpl = createMockFetch(() => {
      page++;
      const count = page === 1 ? 100 : 3;
      const invoices = Array.from({ length: count }, (_, i) => ({ InvoiceID: `inv-${page}-${i}` }));
      return jsonResponse({ Invoices: invoices });
    });
    const accounting = makeAccounting(fetchImpl);

    let count = 0;
    for await (const inv of accounting.invoices.stream(testToken, "tenant-1")) {
      expect(inv.InvoiceID).toBeDefined();
      count++;
    }
    expect(count).toBe(103);
  });
});

describe("AccountingClient.contacts", () => {
  it("create() sends the Contacts envelope", async () => {
    const fetchImpl = createMockFetch((_url, init) => {
      const body = JSON.parse(init.body as string) as { Contacts: unknown[] };
      expect(body.Contacts).toHaveLength(1);
      return jsonResponse({ Contacts: [{ ContactID: "c-1", Name: "Acme Co" }] });
    });
    const accounting = makeAccounting(fetchImpl);

    const contact = await accounting.contacts.create(testToken, "tenant-1", { Name: "Acme Co" });
    expect(contact.ContactID).toBe("c-1");
  });
});

describe("AccountingClient.reports", () => {
  it("balanceSheet() builds the query string and unwraps the report", async () => {
    const fetchImpl = createMockFetch((url) => {
      expect(url).toContain("/Reports/BalanceSheet");
      expect(url).toContain("date=2026-01-01");
      return jsonResponse({ Reports: [{ ReportID: "BalanceSheet", ReportName: "Balance Sheet" }] });
    });
    const accounting = makeAccounting(fetchImpl);

    const report = await accounting.reports.balanceSheet(testToken, "tenant-1", {
      date: "2026-01-01",
    });
    expect(report.ReportName).toBe("Balance Sheet");
  });
});

describe("AccountingClient.attachments", () => {
  it("rejects an unrecognized resource type without making a request", async () => {
    const fetchImpl = createMockFetch(() => {
      throw new Error("should not be called");
    });
    const accounting = makeAccounting(fetchImpl);

    await expect(
      accounting.attachments.list(testToken, "tenant-1", "NotARealResource", "id"),
    ).rejects.toMatchObject({
      type: "config_error",
    });
  });
});
