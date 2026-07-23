/**
 * Helpers for Xero's date formats. Entity types keep dates as raw
 * `string` fields (see `resources/accounting/types.ts`) rather than
 * auto-parsing them — use these when you need a `Date` object or need
 * to build a request payload from one.
 */

const MS_DATE_RE = /^\/Date\((\d+)([+-]\d{4})?\)\/$/;

/**
 * Parses a Xero date string — either the Microsoft-JSON
 * `/Date(ms+tz)/` format used pervasively across the Accounting API,
 * or a plain `YYYY-MM-DD` / ISO 8601 string used by some endpoints —
 * into a `Date`.
 */
export function parseXeroDate(value: string): Date {
  const msMatch = MS_DATE_RE.exec(value);
  if (msMatch?.[1]) {
    return new Date(Number.parseInt(msMatch[1], 10));
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`xero-sdk: unrecognized date format "${value}"`);
  }
  return parsed;
}

/** Formats a `Date` as Xero's Microsoft-JSON `/Date(ms+0000)/` format, for request payloads that expect it. */
export function formatXeroMsDate(date: Date): string {
  return `/Date(${date.getTime()}+0000)/`;
}

/** Formats a `Date` as a plain `YYYY-MM-DD` string, for endpoints that expect a date-only string. */
export function formatXeroDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
