import { describe, expect, it } from "vitest";
import { isSufficientBalance } from "@/services/transfer-balance";

describe("isSufficientBalance", () => {
  it("accepts a transfer that exactly matches the balance", () => {
    expect(isSufficientBalance("100.00", "100")).toBe(true);
    expect(isSufficientBalance("100.00", "100.00")).toBe(true);
  });

  it("accepts a transfer that is smaller than the balance", () => {
    expect(isSufficientBalance("100.00", "99.99")).toBe(true);
    expect(isSufficientBalance("0.02", "0.01")).toBe(true);
  });

  it("rejects a transfer that exceeds the balance", () => {
    expect(isSufficientBalance("99.99", "100")).toBe(false);
    expect(isSufficientBalance("0.01", "0.02")).toBe(false);
  });

  it("rejects any transfer from a negative balance", () => {
    expect(isSufficientBalance("-0.01", "0")).toBe(false);
    expect(isSufficientBalance("-100.00", "1.00")).toBe(false);
  });

  it("normalizes equivalent decimal representations", () => {
    expect(isSufficientBalance("100.5", "100.50")).toBe(true);
    expect(isSufficientBalance("0100.00", "100")).toBe(true);
    expect(isSufficientBalance("0.10", "0.1")).toBe(true);
    expect(isSufficientBalance("1.2", "1.19")).toBe(true);
  });

  it("compares by value rather than string length", () => {
    expect(isSufficientBalance("9.00", "10.00")).toBe(false);
    expect(isSufficientBalance("10.00", "9.00")).toBe(true);
  });

  it("accepts a zero transfer against a zero balance", () => {
    expect(isSufficientBalance("0", "0")).toBe(true);
  });
});
