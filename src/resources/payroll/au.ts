import type { HttpClient } from "../../http/HttpClient.js";
import type { RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";
import { PayrollClientBase, toQuery, type ListParams, type XeroObject } from "./shared.js";

/** Payroll AU (Australia) API client. */
export class PayrollAuClient extends PayrollClientBase {
  constructor(http: HttpClient, baseUrl: string) {
    super(http, baseUrl);
  }

  // -- Employees ---------------------------------------------------------

  async listEmployees(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ Employees: XeroObject[] }>(
      token,
      tenantId,
      "/Employees",
      toQuery(params),
      options,
    );
    return env.Employees;
  }
  getEmployee(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Employees/${id}`, undefined, options);
  }
  createEmployee(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/Employees", { Employees: [attrs] }, options);
  }
  updateEmployee(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Employees/${id}`, { Employees: [attrs] }, options);
  }
  async getEmployeeLeaveBalances(
    token: XeroToken,
    tenantId: string,
    employeeId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ LeaveBalances: XeroObject[] }>(
      token,
      tenantId,
      `/Employees/${employeeId}/LeaveBalances`,
      undefined,
      options,
    );
    return env.LeaveBalances;
  }
  async getEmployeeLeavePeriods(
    token: XeroToken,
    tenantId: string,
    employeeId: string,
    startDate?: string,
    endDate?: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const q = new URLSearchParams();
    if (startDate) q.set("StartDate", startDate);
    if (endDate) q.set("EndDate", endDate);
    const env = await this.g<{ LeavePeriods: XeroObject[] }>(
      token,
      tenantId,
      `/Employees/${employeeId}/LeavePeriods`,
      q,
      options,
    );
    return env.LeavePeriods;
  }
  async getEmployeeLeaveSummary(
    token: XeroToken,
    tenantId: string,
    employeeId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ Employees: XeroObject[] }>(
      token,
      tenantId,
      `/Employees/${employeeId}/LeaveSummary`,
      undefined,
      options,
    );
    return env.Employees;
  }
  updateEmployeeBankAccount(
    token: XeroToken,
    tenantId: string,
    employeeId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Employees/${employeeId}/BankAccounts`, attrs, options);
  }
  /** Updates an employee's tax declaration. Wrapped in `{ TaxDeclaration: attrs }` and posted to `/TaxDeclaration`, matching Xero's actual (non-obvious) shape. */
  updateEmployeeTax(
    token: XeroToken,
    tenantId: string,
    employeeId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(
      token,
      tenantId,
      "POST",
      `/Employees/${employeeId}/TaxDeclaration`,
      { TaxDeclaration: attrs },
      options,
    );
  }
  updateEmployeeOpeningBalances(
    token: XeroToken,
    tenantId: string,
    employeeId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(
      token,
      tenantId,
      "POST",
      `/Employees/${employeeId}/OpeningBalances`,
      attrs,
      options,
    );
  }

  // -- Pay Items -----------------------------------------------------------

  listPayItems(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, "/PayItems", toQuery(params), options);
  }
  createPayItem(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/PayItems", attrs, options);
  }
  updatePayItem(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/PayItems", attrs, options);
  }
  deletePayItem(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.del(token, tenantId, `/PayItems/${id}`, options);
  }

  // -- Payroll Calendars -----------------------------------------------------

  async listPayrollCalendars(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ PayrollCalendars: XeroObject[] }>(
      token,
      tenantId,
      "/PayrollCalendars",
      toQuery(params),
      options,
    );
    return env.PayrollCalendars;
  }
  getPayrollCalendar(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/PayrollCalendars/${id}`, undefined, options);
  }
  createPayrollCalendar(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(
      token,
      tenantId,
      "POST",
      "/PayrollCalendars",
      { PayrollCalendars: [attrs] },
      options,
    );
  }
  updatePayrollCalendar(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(
      token,
      tenantId,
      "POST",
      `/PayrollCalendars/${id}`,
      { PayrollCalendars: [attrs] },
      options,
    );
  }

  // -- Pay Runs --------------------------------------------------------------

  async listPayRuns(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ PayRuns: XeroObject[] }>(
      token,
      tenantId,
      "/PayRuns",
      toQuery(params),
      options,
    );
    return env.PayRuns;
  }
  getPayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/PayRuns/${id}`, undefined, options);
  }
  createPayRun(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/PayRuns", { PayRuns: [attrs] }, options);
  }
  updatePayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/PayRuns/${id}`, { PayRuns: [attrs] }, options);
  }
  postPayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.updatePayRun(
      token,
      tenantId,
      id,
      { PayRunID: id, PayRunStatus: "POSTED" },
      options,
    );
  }
  deletePayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.del(token, tenantId, `/PayRuns/${id}`, options);
  }

  // -- Payslips ----------------------------------------------------------------

  getPayslip(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Payslip/${id}`, undefined, options);
  }
  updatePayslip(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Payslip/${id}`, { Payslip: attrs }, options);
  }

  // -- Timesheets ---------------------------------------------------------------

  async listTimesheets(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ Timesheets: XeroObject[] }>(
      token,
      tenantId,
      "/Timesheets",
      toQuery(params),
      options,
    );
    return env.Timesheets;
  }
  getTimesheet(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Timesheets/${id}`, undefined, options);
  }
  createTimesheet(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/Timesheets", { Timesheets: [attrs] }, options);
  }
  updateTimesheet(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Timesheets/${id}`, { Timesheets: [attrs] }, options);
  }
  approveTimesheet(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Timesheets/${id}/Approve`, {}, options);
  }
  revertTimesheet(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Timesheets/${id}/Revert`, {}, options);
  }
  deleteTimesheet(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.del(token, tenantId, `/Timesheets/${id}`, options);
  }

  // -- Leave -------------------------------------------------------------------

  /** Leave types for the organisation. Note: the AU Payroll API surfaces leave types via the PayItems endpoint (there is no dedicated `/LeaveTypes` route) — pass `params.filter` to filter, e.g. `Type=="LeaveType"`. */
  listLeaveTypes(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, "/PayItems", toQuery(params), options);
  }
  async listLeaveApplications(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ LeaveApplications: XeroObject[] }>(
      token,
      tenantId,
      "/LeaveApplications",
      toQuery(params),
      options,
    );
    return env.LeaveApplications;
  }
  getLeaveApplication(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/LeaveApplications/${id}`, undefined, options);
  }
  createLeaveApplication(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(
      token,
      tenantId,
      "POST",
      "/LeaveApplications",
      { LeaveApplications: [attrs] },
      options,
    );
  }
  updateLeaveApplication(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(
      token,
      tenantId,
      "POST",
      `/LeaveApplications/${id}`,
      { LeaveApplications: [attrs] },
      options,
    );
  }
  deleteLeaveApplication(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.del(token, tenantId, `/LeaveApplications/${id}`, options);
  }

  // -- Settings / Superfunds -----------------------------------------------

  settings(token: XeroToken, tenantId: string, options: RequestOptions = {}): Promise<XeroObject> {
    return this.g(token, tenantId, "/Settings", undefined, options);
  }
  async superfunds(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ Superfunds: XeroObject[] }>(
      token,
      tenantId,
      "/Superfunds",
      toQuery(params),
      options,
    );
    return env.Superfunds;
  }
  getSuperfund(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Superfunds/${id}`, undefined, options);
  }
  async superfundProducts(
    token: XeroToken,
    tenantId: string,
    abn?: string,
    usi?: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const q = new URLSearchParams();
    if (abn) q.set("ABN", abn);
    if (usi) q.set("USI", usi);
    const env = await this.g<{ SuperfundProducts: XeroObject[] }>(
      token,
      tenantId,
      "/SuperfundProducts",
      q,
      options,
    );
    return env.SuperfundProducts;
  }
}
