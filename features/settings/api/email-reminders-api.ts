import type {
  EmailReminder,
  EmailReminderInput,
  EmailReminderPatch,
} from "@/types/email-reminder.types";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error?.message ?? fallback;
}

export async function fetchEmailReminder(): Promise<EmailReminder | null> {
  const response = await fetch("/api/email-reminders");

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Email reminder could not be loaded."),
    );
  }

  return (await response.json()) as EmailReminder;
}

export async function createEmailReminder(
  payload: EmailReminderInput,
): Promise<EmailReminder> {
  const response = await fetch("/api/email-reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Email reminder could not be created."),
    );
  }

  return (await response.json()) as EmailReminder;
}

export async function updateEmailReminder(
  payload: EmailReminderPatch,
): Promise<EmailReminder> {
  const response = await fetch("/api/email-reminders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Email reminder could not be updated."),
    );
  }

  return (await response.json()) as EmailReminder;
}

export async function deleteEmailReminder(): Promise<void> {
  const response = await fetch("/api/email-reminders", { method: "DELETE" });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Email reminder could not be deleted."),
    );
  }
}
