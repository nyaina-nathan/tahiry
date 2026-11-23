import { beforeEach, describe, expect, it } from "vitest";
import {
  createEmailReminder,
  deleteEmailReminder,
  getEmailReminder,
  updateEmailReminder,
} from "@/services/email-reminder.service";
import { prisma, resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import { createUser } from "./helpers/fixtures";

beforeEach(resetDatabase);

describe("email reminders", () => {
  it("creates a reminder and returns the stored time", async () => {
    const user = await createUser();

    const reminder = await createEmailReminder(user.id, {
      day_of_week: 1,
      time: "09:30:00",
    });

    expect(reminder).toMatchObject({
      id_user: user.id,
      day_of_week: 1,
      time: "09:30:00",
    });
    await expect(
      prisma.weekly_reminder.count({ where: { id_user: user.id } }),
    ).resolves.toBe(1);
  });

  it("rejects a second reminder for the same user", async () => {
    const user = await createUser();
    await createEmailReminder(user.id, {
      day_of_week: 1,
      time: "09:30:00",
    });

    await expectAppErrorAsync(
      createEmailReminder(user.id, { day_of_week: 2, time: "10:00:00" }),
      {
        title: "Conflict",
        message: "An email reminder already exists for this user.",
        status: 409,
        origin: "email-reminder",
      },
    );
  });

  it("gets the user's reminder", async () => {
    const user = await createUser();
    const created = await createEmailReminder(user.id, {
      day_of_week: 3,
      time: "18:05:00",
    });

    await expect(getEmailReminder(user.id)).resolves.toEqual(created);
  });

  it("returns not found before a reminder exists", async () => {
    const user = await createUser();

    await expectAppErrorAsync(getEmailReminder(user.id), {
      title: "Not Found",
      message: "Email reminder not found.",
      status: 404,
      origin: "email-reminder",
    });
  });

  it("updates the day, the time, or both", async () => {
    const user = await createUser();
    await createEmailReminder(user.id, { day_of_week: 1, time: "09:30:00" });

    await expect(
      updateEmailReminder(user.id, { day_of_week: 4 }),
    ).resolves.toMatchObject({ day_of_week: 4, time: "09:30:00" });
    await expect(
      updateEmailReminder(user.id, { time: "20:15:30" }),
    ).resolves.toMatchObject({ day_of_week: 4, time: "20:15:30" });
  });

  it("rejects an update before a reminder exists", async () => {
    const user = await createUser();

    await expectAppErrorAsync(
      updateEmailReminder(user.id, { day_of_week: 4 }),
      { status: 404 },
    );
  });

  it("deletes the reminder", async () => {
    const user = await createUser();
    await createEmailReminder(user.id, { day_of_week: 1, time: "09:30:00" });

    await expect(deleteEmailReminder(user.id)).resolves.toBeUndefined();
    await expectAppErrorAsync(getEmailReminder(user.id), { status: 404 });
  });

  it("rejects deleting a missing reminder", async () => {
    const user = await createUser();

    await expectAppErrorAsync(deleteEmailReminder(user.id), { status: 404 });
  });

  it("isolates reminders between users", async () => {
    const user = await createUser();
    const other = await createUser();
    await createEmailReminder(other.id, {
      day_of_week: 2,
      time: "11:00:00",
    });

    await expectAppErrorAsync(getEmailReminder(user.id), { status: 404 });
    await expect(
      createEmailReminder(user.id, { day_of_week: 5, time: "08:00:00" }),
    ).resolves.toMatchObject({ day_of_week: 5 });
  });

  it("rejects invalid user ids", async () => {
    await expectAppErrorAsync(getEmailReminder(null), { status: 401 });
  });
});
