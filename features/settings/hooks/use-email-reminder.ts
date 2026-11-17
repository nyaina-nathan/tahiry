"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { EmailReminder } from "@/types/email-reminder.types";
import {
  createEmailReminder,
  deleteEmailReminder,
  fetchEmailReminder,
  updateEmailReminder,
} from "@/features/settings/api/email-reminders-api";
import {
  localReminderToUtc,
  utcReminderToLocal,
} from "@/features/settings/utils/reminder-time";

const DEFAULT_TIME = "09:00";

function currentMondayBasedDay(): number {
  return (new Date().getDay() + 6) % 7;
}

function reminderTimeValue(time: string): string {
  return time.slice(0, 5);
}

function currentUtcOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

function toLocalReminder(reminder: EmailReminder): EmailReminder {
  const local = utcReminderToLocal(
    reminder.day_of_week,
    reminder.time,
    currentUtcOffsetMinutes(),
  );

  return {
    ...reminder,
    day_of_week: local.dayOfWeek,
    time: local.time,
  };
}

export function useEmailReminder() {
  const [reminder, setReminder] = useState<EmailReminder | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState(currentMondayBasedDay);
  const [time, setTime] = useState(DEFAULT_TIME);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReminder = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const loadedReminder = await fetchEmailReminder();

      if (loadedReminder) {
        const localReminder = toLocalReminder(loadedReminder);
        setReminder(localReminder);
        setDayOfWeek(localReminder.day_of_week);
        setTime(reminderTimeValue(localReminder.time));
      } else {
        setReminder(null);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Email reminder could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading the external reminder state is the purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReminder();
  }, [loadReminder]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<boolean> {
    event.preventDefault();

    if (isSaving || isDeleting) {
      return false;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const utc = localReminderToUtc(
        dayOfWeek,
        time,
        currentUtcOffsetMinutes(),
      );
      const payload = { day_of_week: utc.dayOfWeek, time: utc.time };
      const savedReminder = reminder
        ? await updateEmailReminder(payload)
        : await createEmailReminder(payload);
      const localReminder = toLocalReminder(savedReminder);

      setReminder(localReminder);
      setDayOfWeek(localReminder.day_of_week);
      setTime(reminderTimeValue(localReminder.time));
      setSuccess("Your weekly reminder has been saved.");
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Email reminder could not be saved.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (isSaving || isDeleting || !reminder) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteEmailReminder();
      setReminder(null);
      setDayOfWeek(currentMondayBasedDay());
      setTime(DEFAULT_TIME);
      setSuccess("Your weekly reminder has been deleted.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Email reminder could not be deleted.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    reminder,
    dayOfWeek,
    setDayOfWeek,
    time,
    setTime,
    isLoading,
    isSaving,
    isDeleting,
    error,
    success,
    loadReminder,
    handleSubmit,
    handleDelete,
  };
}
