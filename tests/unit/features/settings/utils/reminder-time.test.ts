import { describe, expect, it } from "vitest";
import {
  localReminderToUtc,
  utcReminderToLocal,
} from "@/features/settings/utils/reminder-time";

describe("localReminderToUtc", () => {
  it("converts a local reminder time to UTC", () => {
    expect(localReminderToUtc(0, "09:30", -300)).toEqual({
      dayOfWeek: 0,
      time: "14:30:00",
    });
  });

  it("moves the reminder weekday forward when local time crosses UTC midnight", () => {
    expect(localReminderToUtc(0, "00:30", 600)).toEqual({
      dayOfWeek: 6,
      time: "14:30:00",
    });
  });

  it("handles positive and negative offsets", () => {
    expect(localReminderToUtc(3, "18:00", 120)).toEqual({
      dayOfWeek: 3,
      time: "16:00:00",
    });
    expect(localReminderToUtc(3, "18:00", -120)).toEqual({
      dayOfWeek: 3,
      time: "20:00:00",
    });
  });

  it("preserves seconds when provided", () => {
    expect(localReminderToUtc(2, "08:15:45", 0)).toEqual({
      dayOfWeek: 2,
      time: "08:15:45",
    });
  });

  it("treats the input weekday as Monday-based", () => {
    expect(localReminderToUtc(6, "12:00", 0)).toEqual({
      dayOfWeek: 6,
      time: "12:00:00",
    });
  });
});

describe("utcReminderToLocal", () => {
  it("converts a stored UTC reminder back to local time", () => {
    expect(utcReminderToLocal(6, "14:30:00", 600)).toEqual({
      dayOfWeek: 0,
      time: "00:30",
    });
  });

  it("returns the local time as HH:mm", () => {
    expect(utcReminderToLocal(1, "14:45:59", 0)).toEqual({
      dayOfWeek: 1,
      time: "14:45",
    });
  });

  it("moves the weekday backward when UTC time crosses local midnight", () => {
    expect(utcReminderToLocal(0, "01:00:00", -300)).toEqual({
      dayOfWeek: 6,
      time: "20:00",
    });
  });

  it("round-trips a local reminder through UTC", () => {
    const utc = localReminderToUtc(4, "07:05", 330);

    expect(utcReminderToLocal(utc.dayOfWeek, utc.time, 330)).toEqual({
      dayOfWeek: 4,
      time: "07:05",
    });
  });
});
