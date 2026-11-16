import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { isSufficientBalance } from "./transfer-balance.ts";

test("accepts a transfer that does not exceed the source balance", () => {
  assert.equal(
    isSufficientBalance("100.00", "100"),
    true,
  );
});

test("rejects a transfer that exceeds the source balance", () => {
  assert.equal(
    isSufficientBalance("99.99", "100"),
    false,
  );
});
