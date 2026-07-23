import { AccountingResourceBase, first, type ListParams } from "./base.js";
import type { Organisation, XeroObject } from "./types.js";
import type { XeroToken } from "../../auth/index.js";

export class OrganisationResource extends AccountingResourceBase {
  async get(token: XeroToken, tenantId: string, signal?: AbortSignal): Promise<Organisation> {
    const env = await this.httpGet<{ Organisations: Organisation[] }>(
      token,
      tenantId,
      "/Organisation",
      {},
      signal,
    );
    return first(env.Organisations);
  }

  /** Actions the current user is permitted to perform (e.g. "CREATE_PAYMENTS") — useful for feature-gating a UI. */
  async getActions(
    token: XeroToken,
    tenantId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ Actions: XeroObject[] }>(
      token,
      tenantId,
      "/Organisation/Actions",
      {},
      signal,
    );
    return env.Actions;
  }

  async getCisSettings(
    token: XeroToken,
    tenantId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<{ CISSettings: XeroObject[] }>(
      token,
      tenantId,
      "/Organisation/CISSettings",
      {},
      signal,
    );
    return first(env.CISSettings);
  }

  async listCurrencies(
    token: XeroToken,
    tenantId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ Currencies: XeroObject[] }>(
      token,
      tenantId,
      "/Currencies",
      {},
      signal,
    );
    return env.Currencies;
  }

  async createCurrency(
    token: XeroToken,
    tenantId: string,
    code: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ Currencies: XeroObject[] }>(
      token,
      tenantId,
      "PUT",
      "/Currencies",
      { Code: code },
      { signal },
    );
    return first(env.Currencies);
  }

  async listBrandingThemes(
    token: XeroToken,
    tenantId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ BrandingThemes: XeroObject[] }>(
      token,
      tenantId,
      "/BrandingThemes",
      {},
      signal,
    );
    return env.BrandingThemes;
  }

  async getBrandingTheme(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<{ BrandingThemes: XeroObject[] }>(
      token,
      tenantId,
      this.idPath("BrandingThemes", id),
      {},
      signal,
    );
    return first(env.BrandingThemes);
  }

  async brandingThemePaymentServices(
    token: XeroToken,
    tenantId: string,
    brandingThemeId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ PaymentServices: XeroObject[] }>(
      token,
      tenantId,
      `${this.idPath("BrandingThemes", brandingThemeId)}/PaymentServices`,
      {},
      signal,
    );
    return env.PaymentServices;
  }

  async createBrandingThemePaymentService(
    token: XeroToken,
    tenantId: string,
    brandingThemeId: string,
    attrs: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ PaymentServices: XeroObject[] }>(
      token,
      tenantId,
      "PUT",
      `${this.idPath("BrandingThemes", brandingThemeId)}/PaymentServices`,
      attrs,
      { signal },
    );
    return first(env.PaymentServices);
  }

  async getInvoiceReminderSettings(
    token: XeroToken,
    tenantId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    return this.httpGet<XeroObject>(token, tenantId, "/InvoiceReminders/Settings", {}, signal);
  }

  async updateInvoiceReminderSettings(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    return this.httpSend<XeroObject>(token, tenantId, "POST", "/InvoiceReminders/Settings", attrs, {
      signal,
    });
  }

  async listPaymentServices(
    token: XeroToken,
    tenantId: string,
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ PaymentServices: XeroObject[] }>(
      token,
      tenantId,
      "/PaymentServices",
      {},
      signal,
    );
    return env.PaymentServices;
  }

  async getPaymentService(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpGet<{ PaymentServices: XeroObject[] }>(
      token,
      tenantId,
      this.idPath("PaymentServices", id),
      {},
      signal,
    );
    return first(env.PaymentServices);
  }

  async createPaymentService(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ PaymentServices: XeroObject[] }>(
      token,
      tenantId,
      "PUT",
      "/PaymentServices",
      { PaymentServices: [attrs] },
      { signal },
    );
    return first(env.PaymentServices);
  }

  async deletePaymentService(
    token: XeroToken,
    tenantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.httpSend(token, tenantId, "DELETE", this.idPath("PaymentServices", id), undefined, {
      signal,
    });
  }

  async listTaxRates(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    signal?: AbortSignal,
  ): Promise<XeroObject[]> {
    const env = await this.httpGet<{ TaxRates: XeroObject[] }>(
      token,
      tenantId,
      "/TaxRates",
      params,
      signal,
    );
    return env.TaxRates;
  }

  async createTaxRate(
    token: XeroToken,
    tenantId: string,
    rate: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ TaxRates: XeroObject[] }>(
      token,
      tenantId,
      "POST",
      "/TaxRates",
      { TaxRates: [rate] },
      { signal },
    );
    return first(env.TaxRates);
  }

  /** Updates an existing tax rate (matched by Name). */
  async updateTaxRate(
    token: XeroToken,
    tenantId: string,
    rate: XeroObject,
    signal?: AbortSignal,
  ): Promise<XeroObject> {
    const env = await this.httpSend<{ TaxRates: XeroObject[] }>(
      token,
      tenantId,
      "POST",
      "/TaxRates",
      { TaxRates: [rate] },
      { signal },
    );
    return first(env.TaxRates);
  }
}
