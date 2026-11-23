import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleWeeklyEmails } from "@/services/weekly-email.service";
import { prisma, resetDatabase } from "./helpers/database";
import {
  createCategory,
  createMovement,
  createUser,
} from "./helpers/fixtures";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

const NOW = new Date("2026-11-16T10:00:00.000Z");

beforeEach(async () => {
  await resetDatabase();
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
});

async function createReminder(
  userId: string,
  dayOfWeek: number,
  time = "09:00:00",
) {
  return prisma.weekly_reminder.create({
    data: {
      id_user: userId,
      day_of_week: dayOfWeek,
      time: `1970-01-01T${time}Z`,
    },
  });
}

describe("scheduleWeeklyEmails", () => {
  it("schedules a summary for reminders matching the current weekday", async () => {
    const user = await createUser({
      username: "Ada",
      email: "ada@example.com",
      currency: "USD",
    });
    await createReminder(user.id, 0);
    const salary = await createCategory(user.id, "Salary", "INCOME");
    const food = await createCategory(user.id, "Food", "EXPENSE");

    await createMovement(user.id, {
      title: "Salary",
      movement_type: "INCOME",
      id_category: salary.id,
      amount: "100.00",
      logged_for: new Date("2026-11-10T00:00:00.000Z"),
    });
    await createMovement(user.id, {
      title: "Groceries",
      movement_type: "EXPENSE",
      id_category: food.id,
      amount: "40.00",
      logged_for: new Date("2026-11-12T00:00:00.000Z"),
    });

    const result = await scheduleWeeklyEmails(NOW);

    expect(result).toEqual({ matched: 1, scheduled: 1, failed: 0 });
    expect(mockSend).toHaveBeenCalledTimes(1);

    const message = mockSend.mock.calls[0][0] as {
      to: string;
      subject: string;
      scheduledAt: string;
      html: string;
    };
    expect(message.to).toBe("ada@example.com");
    expect(message.subject).toBe("Your weekly summary");
    expect(message.scheduledAt).toBe("2026-11-16T09:00:00.000Z");
    expect(message.html).toContain("Hi Ada,");
    expect(message.html).toContain("from 2026-11-10 to 2026-11-16");
    expect(message.html).toContain("Total income: <strong>100.00 USD</strong>");
    expect(message.html).toContain("Total spending: <strong>40.00 USD</strong>");
    expect(message.html).toContain("<td>Salary</td>");
    expect(message.html).toContain("<td>Food</td>");
  });

  it("ignores reminders scheduled for other weekdays", async () => {
    const user = await createUser();
    await createReminder(user.id, 1);

    await expect(scheduleWeeklyEmails(NOW)).resolves.toEqual({
      matched: 0,
      scheduled: 0,
      failed: 0,
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("counts provider failures without stopping the run", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = await createUser();
    await createReminder(user.id, 0);
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Provider unavailable" },
    });

    await expect(scheduleWeeklyEmails(NOW)).resolves.toEqual({
      matched: 1,
      scheduled: 0,
      failed: 1,
    });
    expect(console.error).toHaveBeenCalledWith(
      "Failed to schedule weekly email",
      expect.objectContaining({ userId: user.id }),
    );
  });

  it("counts thrown provider errors as failures", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = await createUser();
    await createReminder(user.id, 0);
    mockSend.mockRejectedValueOnce(new Error("Network error"));

    await expect(scheduleWeeklyEmails(NOW)).resolves.toEqual({
      matched: 1,
      scheduled: 0,
      failed: 1,
    });
  });

  it("excludes movements outside the seven-day window", async () => {
    const user = await createUser();
    await createReminder(user.id, 0);
    await createMovement(user.id, {
      movement_type: "INCOME",
      amount: "999.00",
      logged_for: new Date("2026-11-09T00:00:00.000Z"),
    });
    await createMovement(user.id, {
      movement_type: "INCOME",
      amount: "888.00",
      logged_for: new Date("2026-11-17T00:00:00.000Z"),
    });

    await scheduleWeeklyEmails(NOW);

    const html = (mockSend.mock.calls[0][0] as { html: string }).html;
    expect(html).toContain("Total income: <strong>0.00 USD</strong>");
    expect(html).not.toContain("999.00");
    expect(html).not.toContain("888.00");
  });

  it("renders placeholder rows when the week has no categories", async () => {
    const user = await createUser();
    await createReminder(user.id, 0);

    await scheduleWeeklyEmails(NOW);

    const html = (mockSend.mock.calls[0][0] as { html: string }).html;
    expect(html.match(/No data/g)).toHaveLength(2);
  });

  it("fails fast when the email provider is not configured", async () => {
    const originalApiKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    try {
      await expect(scheduleWeeklyEmails(NOW)).rejects.toThrow(
        "RESEND_API_KEY and EMAIL_FROM must be configured.",
      );
      expect(mockSend).not.toHaveBeenCalled();
    } finally {
      process.env.RESEND_API_KEY = originalApiKey;
    }
  });
});
