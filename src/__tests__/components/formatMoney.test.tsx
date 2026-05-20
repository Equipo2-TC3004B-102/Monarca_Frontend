/**
 * formatMoney.test.tsx
 * Description: Test suite for the formatMoney utility function, validating correct currency 
 * formatting, handling of invalid inputs, and edge cases such as negative numbers and Infinity.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 * 20/05/2026 [Diego de la Vega] Added tests for string numeric inputs (PostgreSQL decimal strings) and currency code support.
 */

import { describe, it, expect } from "vitest";
import formatMoney from "./../../utils/formatMoney";

describe("formatMoney", () => {
  it("formats valid numbers correctly", () => {
    expect(formatMoney(1234.56)).toBe("$1,234.56");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(999999.99)).toBe("$999,999.99");
  });

  it("handles invalid inputs", () => {
    expect(formatMoney(NaN)).toBe("$0.00");
    expect(formatMoney("invalid" as any)).toBe("$0.00");
    expect(formatMoney(null as any)).toBe("$0.00");
    expect(formatMoney(undefined as any)).toBe("$0.00");
  });

  it("handles edge cases", () => {
    expect(formatMoney(-100)).toBe("-$100.00");
    expect(formatMoney(0.01)).toBe("$0.01");
    expect(formatMoney(Infinity)).toBe("$∞");
  });

  it("parses PostgreSQL decimal strings correctly (regression: was returning $0.00)", () => {
    // PostgreSQL returns numeric/decimal columns as strings in JSON.
    // Before the fix, formatMoney("1160.00") returned "$0.00".
    expect(formatMoney("1160.00" as any)).toBe("$1,160.00");
    expect(formatMoney("500.50" as any)).toBe("$500.50");
    expect(formatMoney("0.00" as any)).toBe("$0.00");
    expect(formatMoney("8993" as any)).toBe("$8,993.00");
    expect(formatMoney("10000.99" as any)).toBe("$10,000.99");
  });

  it("accepts an explicit currency code", () => {
    // Use toContain to avoid locale-specific currency symbol differences
    // (es-MX may render USD as "USD 520.00" or "US$520.00" depending on runtime)
    expect(formatMoney(520, "USD")).toContain("520.00");
    expect(formatMoney(1000, "MXN")).toContain("1,000.00");
    // String input also respects the currency code
    expect(formatMoney("750.50" as any, "USD")).toContain("750.50");
  });
});
