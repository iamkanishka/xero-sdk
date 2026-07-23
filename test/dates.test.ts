import { describe, it, expect } from "vitest";
import { parseXeroDate, formatXeroDate, formatXeroMsDate } from "../src/dates.js";

describe("parseXeroDate", () => {
  it("parses Microsoft-JSON /Date(ms+tz)/ format", () => {
    const d = parseXeroDate("/Date(1735689600000+0000)/");
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBe(0);
    expect(d.getUTCDate()).toBe(1);
  });

  it("parses plain YYYY-MM-DD", () => {
    const d = parseXeroDate("2026-03-15");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(2);
    expect(d.getUTCDate()).toBe(15);
  });

  it("throws on unrecognized format", () => {
    expect(() => parseXeroDate("not-a-date")).toThrow();
  });
});

describe("formatXeroMsDate / formatXeroDate", () => {
  it("round-trips through parseXeroDate", () => {
    const original = new Date(Date.UTC(2026, 2, 15));
    const formatted = formatXeroMsDate(original);
    const parsed = parseXeroDate(formatted);
    expect(parsed.getTime()).toBe(original.getTime());
  });

  it("formats a date-only string", () => {
    const d = new Date(Date.UTC(2026, 2, 15));
    expect(formatXeroDate(d)).toBe("2026-03-15");
  });
});
