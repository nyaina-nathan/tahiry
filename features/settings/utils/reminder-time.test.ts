import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { localReminderToUtc, utcReminderToLocal } from "./reminder-time.ts";

test("converts a local reminder time to UTC", () => {
  assert.deepEqual(localReminderToUtc(0, "09:30", -300), {
    dayOfWeek: 0,
    time: "14:30:00",
  });
});

test("moves the reminder weekday when local time crosses UTC midnight", () => {
  assert.deepEqual(localReminderToUtc(0, "00:30", 600), {
    dayOfWeek: 6,
    time: "14:30:00",
  });
});

test("converts a stored UTC reminder back to local time", () => {
  assert.deepEqual(utcReminderToLocal(6, "14:30:00", 600), {
    dayOfWeek: 0,
    time: "00:30",
  });
});
