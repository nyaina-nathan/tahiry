import { describe, expect, it, vi } from "vitest";
import {
  createEmailReminder,
  deleteEmailReminder,
  fetchEmailReminder,
  updateEmailReminder,
} from "@/features/settings/api/email-reminders-api";

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const reminder = {
  id: "reminder-1",
  id_user: "user-1",
  day_of_week: 1,
  time: "09:30:00",
};

describe("fetchEmailReminder", () => {
  it("returns null when no reminder exists", async () => {
    stubFetch(new Response(null, { status: 404 }));

    await expect(fetchEmailReminder()).resolves.toBeNull();
  });

  it("returns the reminder payload", async () => {
    stubFetch(Response.json(reminder));

    await expect(fetchEmailReminder()).resolves.toEqual(reminder);
  });

  it("surfaces API error messages", async () => {
    stubFetch(
      Response.json(
        { error: { message: "Reminder could not be loaded." } },
        { status: 500 },
      ),
    );

    await expect(fetchEmailReminder()).rejects.toThrow(
      "Reminder could not be loaded.",
    );
  });

  it("falls back when the error body is unusable", async () => {
    stubFetch(new Response("Bad gateway", { status: 502 }));

    await expect(fetchEmailReminder()).rejects.toThrow(
      "Email reminder could not be loaded.",
    );
  });
});

describe("createEmailReminder", () => {
  it("posts the reminder payload", async () => {
    const fetchMock = stubFetch(
      Response.json(reminder, { status: 201 }),
    );

    await expect(
      createEmailReminder({ day_of_week: 1, time: "09:30:00" }),
    ).resolves.toEqual(reminder);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/email-reminders");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      day_of_week: 1,
      time: "09:30:00",
    });
  });

  it("surfaces the create fallback message", async () => {
    stubFetch(new Response("nope", { status: 500 }));

    await expect(
      createEmailReminder({ day_of_week: 1, time: "09:30:00" }),
    ).rejects.toThrow("Email reminder could not be created.");
  });
});

describe("updateEmailReminder", () => {
  it("patches the reminder payload", async () => {
    const fetchMock = stubFetch(Response.json(reminder));

    await expect(
      updateEmailReminder({ time: "10:00:00" }),
    ).resolves.toEqual(reminder);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/email-reminders");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({ time: "10:00:00" });
  });

  it("surfaces the update fallback message", async () => {
    stubFetch(new Response("nope", { status: 500 }));

    await expect(updateEmailReminder({ time: "10:00:00" })).rejects.toThrow(
      "Email reminder could not be updated.",
    );
  });
});

describe("deleteEmailReminder", () => {
  it("sends a DELETE request", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));

    await expect(deleteEmailReminder()).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/email-reminders");
    expect(init.method).toBe("DELETE");
  });

  it("surfaces the delete fallback message", async () => {
    stubFetch(new Response("nope", { status: 500 }));

    await expect(deleteEmailReminder()).rejects.toThrow(
      "Email reminder could not be deleted.",
    );
  });
});
