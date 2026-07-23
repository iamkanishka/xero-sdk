import type { HttpClient } from "../../http/HttpClient.js";
import type { RequestOptions } from "../../http/index.js";
import type { XeroToken } from "../../auth/index.js";
import { PayrollClientBase, toQuery, type ListParams, type XeroObject } from "./shared.js";

/** Payroll UK API client. */
export class PayrollUkClient extends PayrollClientBase {
  constructor(http: HttpClient, baseUrl: string) {
    super(http, baseUrl);
  }

  // -- Employees -----------------------------------------------------------

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
    return this.j(token, tenantId, "POST", "/Employees", attrs, options);
  }
  updateEmployee(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/Employees/${id}`, attrs, options);
  }
  getEmployeeTax(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Employees/${id}/Tax`, undefined, options);
  }
  updateEmployeeTax(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Employees/${id}/Tax`, attrs, options);
  }
  getEmployeeNi(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Employees/${id}/NationalInsurance`, undefined, options);
  }
  updateEmployeeNi(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Employees/${id}/NationalInsurance`, attrs, options);
  }
  getEmployeePayment(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Employees/${id}/PaymentMethod`, undefined, options);
  }
  updateEmployeePayment(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Employees/${id}/PaymentMethod`, attrs, options);
  }
  async getEmployeeLeaveBalances(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ LeaveBalances: XeroObject[] }>(
      token,
      tenantId,
      `/Employees/${id}/LeaveBalances`,
      undefined,
      options,
    );
    return env.LeaveBalances;
  }
  async getEmployeeLeave(
    token: XeroToken,
    tenantId: string,
    id: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ LeavePeriods: XeroObject[] }>(
      token,
      tenantId,
      `/Employees/${id}/Leave`,
      toQuery(params),
      options,
    );
    return env.LeavePeriods;
  }
  createEmployeeLeave(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Employees/${id}/Leave`, attrs, options);
  }
  updateEmployeeLeave(
    token: XeroToken,
    tenantId: string,
    id: string,
    leaveId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/Employees/${id}/Leave/${leaveId}`, attrs, options);
  }
  deleteEmployeeLeave(
    token: XeroToken,
    tenantId: string,
    id: string,
    leaveId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.del(token, tenantId, `/Employees/${id}/Leave/${leaveId}`, options);
  }
  getWorkingPattern(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Employees/${id}/WorkingPattern`, undefined, options);
  }
  updateWorkingPattern(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/Employees/${id}/WorkingPattern`, attrs, options);
  }

  // -- Pay Runs / Pay Run Calendars -----------------------------------------

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
    return this.j(token, tenantId, "POST", "/PayRuns", attrs, options);
  }
  updatePayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/PayRuns/${id}`, attrs, options);
  }
  postPayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/PayRuns/${id}/Post`, {}, options);
  }
  revertPayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", `/PayRuns/${id}/Revert`, {}, options);
  }
  deletePayRun(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.del(token, tenantId, `/PayRuns/${id}`, options);
  }
  async listPayRunCalendars(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ PayRunCalendars: XeroObject[] }>(
      token,
      tenantId,
      "/PayRunCalendars",
      toQuery(params),
      options,
    );
    return env.PayRunCalendars;
  }
  getPayRunCalendar(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/PayRunCalendars/${id}`, undefined, options);
  }
  createPayRunCalendar(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/PayRunCalendars", attrs, options);
  }

  // -- Payslips / Earnings Rates / Deduction Types / Reimbursements --------

  getPayslip(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/Payslips/${id}`, undefined, options);
  }
  updatePayslip(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/Payslips/${id}`, attrs, options);
  }
  async listEarningsRates(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ EarningsRates: XeroObject[] }>(
      token,
      tenantId,
      "/EarningsRates",
      toQuery(params),
      options,
    );
    return env.EarningsRates;
  }
  getEarningsRate(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/EarningsRates/${id}`, undefined, options);
  }
  createEarningsRate(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/EarningsRates", attrs, options);
  }
  updateEarningsRate(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/EarningsRates/${id}`, attrs, options);
  }
  async listDeductionTypes(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ DeductionTypes: XeroObject[] }>(
      token,
      tenantId,
      "/DeductionTypes",
      toQuery(params),
      options,
    );
    return env.DeductionTypes;
  }
  getDeductionType(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/DeductionTypes/${id}`, undefined, options);
  }
  createDeductionType(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/DeductionTypes", attrs, options);
  }
  updateDeductionType(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/DeductionTypes/${id}`, attrs, options);
  }
  async listReimbursements(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ Reimbursements: XeroObject[] }>(
      token,
      tenantId,
      "/Reimbursements",
      toQuery(params),
      options,
    );
    return env.Reimbursements;
  }
  createReimbursement(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/Reimbursements", attrs, options);
  }
  updateReimbursement(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/Reimbursements/${id}`, attrs, options);
  }

  // -- Leave Types / Settings / Statutory Leave / Timesheets ---------------

  async listLeaveTypes(
    token: XeroToken,
    tenantId: string,
    params: ListParams = {},
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ LeaveTypes: XeroObject[] }>(
      token,
      tenantId,
      "/LeaveTypes",
      toQuery(params),
      options,
    );
    return env.LeaveTypes;
  }
  getLeaveType(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/LeaveTypes/${id}`, undefined, options);
  }
  createLeaveType(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/LeaveTypes", attrs, options);
  }
  updateLeaveType(
    token: XeroToken,
    tenantId: string,
    id: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "PUT", `/LeaveTypes/${id}`, attrs, options);
  }
  settings(token: XeroToken, tenantId: string, options: RequestOptions = {}): Promise<XeroObject> {
    return this.g(token, tenantId, "/Settings", undefined, options);
  }
  statutoryLeave(
    token: XeroToken,
    tenantId: string,
    employeeId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.g(token, tenantId, `/StatutoryLeaves/${employeeId}`, undefined, options);
  }
  createStatutoryLeave(
    token: XeroToken,
    tenantId: string,
    attrs: XeroObject,
    options: RequestOptions = {},
  ): Promise<XeroObject> {
    return this.j(token, tenantId, "POST", "/StatutoryLeaves", attrs, options);
  }
  deleteStatutoryLeave(
    token: XeroToken,
    tenantId: string,
    id: string,
    options: RequestOptions = {},
  ): Promise<void> {
    return this.del(token, tenantId, `/StatutoryLeaves/${id}`, options);
  }
  async getStatutoryLeavePeriods(
    token: XeroToken,
    tenantId: string,
    statutoryLeaveId: string,
    options: RequestOptions = {},
  ): Promise<XeroObject[]> {
    const env = await this.g<{ LeavePeriods: XeroObject[] }>(
      token,
      tenantId,
      `/StatutoryLeaves/${statutoryLeaveId}/LeavePeriods`,
      undefined,
      options,
    );
    return env.LeavePeriods;
  }
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
    return this.j(token, tenantId, "POST", "/Timesheets", attrs, options);
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
}
