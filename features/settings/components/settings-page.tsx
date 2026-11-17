"use client";

import { useState } from "react";
import { AppHeader, PRIMARY_NAV_LINKS } from "@/components/app-header";
import { useEmailReminder } from "@/features/settings/hooks/use-email-reminder";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const {
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
  } = useEmailReminder();

  return (
    <main className="min-h-screen bg-(--color-canvas)">
      <AppHeader links={PRIMARY_NAV_LINKS} />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="mb-10 border-b border-(--color-line) pb-10">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
            Settings
          </p>
          <h1 className="font-display text-5xl leading-none tracking-tight text-(--color-ink) sm:text-7xl">
            Your preferences.
          </h1>
        </div>

        <section
          aria-labelledby="email-reminder-heading"
          className="w-full border border-(--color-line) bg-(--color-surface) p-5 sm:p-8"
        >
          <div className="mb-8">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-accent)">
              Email reminders
            </p>
            <h2
              id="email-reminder-heading"
              className="font-display text-3xl text-(--color-ink) sm:text-4xl"
            >
              Weekly money summary.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-(--color-muted)">
              Choose when you want to receive a weekly summary of your income
              and spending.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4" aria-label="Loading email reminder">
              <div className="h-11 animate-pulse bg-(--color-canvas)" />
              <div className="h-11 animate-pulse bg-(--color-canvas)" />
              <div className="h-11 w-32 animate-pulse bg-(--color-canvas)" />
            </div>
          ) : !reminder || isEditing ? (
            <form
              onSubmit={async (event) => {
                const saved = await handleSubmit(event);

                if (saved && reminder) {
                  setIsEditing(false);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <label className="block">
                  <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted)">
                    Day
                  </span>
                  <select
                    value={dayOfWeek}
                    onChange={(event) => setDayOfWeek(Number(event.target.value))}
                    className="min-h-11 w-full border border-(--color-line) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus:border-(--color-accent) focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted)">
                    Time
                  </span>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    required
                    className="min-h-11 w-full border border-(--color-line) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus:border-(--color-accent) focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="min-h-11 border border-(--color-ink) bg-(--color-ink) px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-surface) transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : reminder
                      ? "Update reminder"
                      : "Create reminder"}
                </button>

                {reminder && (
                  <button
                    type="button"
                    onClick={() => {
                      setDayOfWeek(reminder.day_of_week);
                      setTime(reminder.time.slice(0, 5));
                      setIsEditing(false);
                    }}
                    disabled={isSaving || isDeleting}
                    className="min-h-11 border border-(--color-line) px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted) transition-colors hover:border-(--color-ink) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}

                {!reminder && (
                  <button
                    type="button"
                    onClick={() => void loadReminder()}
                    disabled={isSaving || isDeleting}
                    className="min-h-11 border border-(--color-line) px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted) transition-colors hover:border-(--color-ink) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div>
              <dl className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted)">
                    Day
                  </dt>
                  <dd className="mt-2 text-lg text-(--color-ink)">
                    {DAYS_OF_WEEK[reminder.day_of_week]}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted)">
                    Time
                  </dt>
                  <dd className="mt-2 text-lg text-(--color-ink)">
                    {reminder.time.slice(0, 5)}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                  className="min-h-11 border border-(--color-ink) bg-(--color-ink) px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-surface) transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Update reminder
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className="min-h-11 border border-(--color-negative-line) px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-negative-strong) transition-colors hover:bg-(--color-negative-soft) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-negative) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "Deleting..." : "Delete reminder"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 border-l-4 border-(--color-negative) bg-(--color-negative-soft) px-4 py-3 text-sm text-(--color-negative-strong)"
            >
              {error}
              <button
                type="button"
                onClick={() => void loadReminder()}
                className="ml-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] underline"
              >
                Try again
              </button>
            </div>
          )}

          {success && (
            <p
              role="status"
              className="mt-6 border-l-4 border-(--color-accent) bg-(--color-canvas) px-4 py-3 text-sm text-(--color-ink)"
            >
              {success}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
