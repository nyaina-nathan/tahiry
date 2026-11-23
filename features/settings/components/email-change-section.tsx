"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { requestEmailChange } from "@/features/settings/api/email-change-api";

type EmailChangeSectionProps = {
  currentEmail: string | null;
  isLoading: boolean;
};

export function EmailChangeSection({
  currentEmail,
  isLoading,
}: EmailChangeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const passwordDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = passwordDialogRef.current;
    if (!dialog) {
      return;
    }

    if (isPasswordModalOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isPasswordModalOpen && dialog.open) {
      dialog.close();
    }
  }, [isPasswordModalOpen]);

  function beginEditing() {
    if (!currentEmail) {
      return;
    }

    setNewEmail(currentEmail);
    setCurrentPassword("");
    setError("");
    setSuccess("");
    setIsPasswordModalOpen(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setNewEmail("");
    setCurrentPassword("");
    setError("");
    setIsPasswordModalOpen(false);
    setIsEditing(false);
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCurrentPassword("");
    setError("");
    setIsPasswordModalOpen(true);
  }

  function cancelPasswordModal() {
    if (isSubmitting) {
      return;
    }

    setCurrentPassword("");
    setError("");
    setIsPasswordModalOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const requestedEmail = newEmail.trim();

    try {
      await requestEmailChange({
        newEmail: requestedEmail,
        currentPassword,
      });
      setIsEditing(false);
      setIsPasswordModalOpen(false);
      setNewEmail("");
      setCurrentPassword("");
      setSuccess(
        `We sent a confirmation link to ${requestedEmail}. Your current email stays active until you confirm the change.`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Your email change request could not be sent.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      aria-labelledby="email-change-heading"
      className="mt-10 border-t border-(--color-line) pt-8"
    >
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-accent)">
          Email address
        </p>
        <h3
          id="email-change-heading"
          className="font-semibold text-2xl text-(--color-ink) sm:text-3xl"
        >
          Manage your sign-in email.
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-(--color-muted)">
          Your email is used to sign in and receive account messages.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-label="Loading email address">
          <div className="h-4 w-56 animate-pulse bg-(--color-canvas)" />
          <div className="h-11 w-36 animate-pulse bg-(--color-canvas)" />
        </div>
      ) : isEditing ? (
        <form onSubmit={handleContinue} className="space-y-6">
          <label className="block max-w-xl">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted)">
              New email
            </span>
            <input
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              required
              maxLength={255}
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-[0.7rem] border border-(--color-line) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus:border-(--color-accent) focus:outline-none disabled:opacity-60"
            />
          </label>

          <p className="text-sm leading-6 text-(--color-muted)">
            We’ll email a confirmation link to the new address. Your current
            email remains active until you confirm it.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 rounded-[0.65rem] border border-(--color-ink) bg-(--color-ink) px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-surface) transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSubmitting}
              className="min-h-11 rounded-[0.65rem] border border-(--color-line) px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted) transition-colors hover:border-(--color-ink) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <dl>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted)">
                Current email
              </dt>
              <dd className="mt-2 break-all text-lg text-(--color-ink)">
                {currentEmail || "Email address unavailable"}
              </dd>
            </div>
          </dl>

          {currentEmail && (
            <div className="mt-8">
              <button
                type="button"
                onClick={beginEditing}
                className="min-h-11 rounded-[0.65rem] border border-(--color-ink) bg-(--color-ink) px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-surface) transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
              >
                Change email
              </button>
            </div>
          )}
        </div>
      )}

      {success && (
        <p
          role="status"
          className="mt-6 rounded-[0.8rem] border border-(--color-line) bg-(--color-canvas) px-4 py-3 text-sm text-(--color-ink)"
        >
          {success}
        </p>
      )}

      <dialog
        ref={passwordDialogRef}
        aria-labelledby="email-change-password-heading"
        onCancel={(event) => {
          event.preventDefault();
          cancelPasswordModal();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[1.25rem] border border-(--color-line) bg-(--color-surface) p-0 text-(--color-ink) shadow-xl backdrop:bg-black/60"
      >
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-6 p-6 sm:p-8"
        >
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-accent)">
              Confirm it’s you
            </p>
            <h3
              id="email-change-password-heading"
              className="font-semibold text-2xl text-(--color-ink)"
            >
              Enter your password.
            </h3>
            <p className="mt-3 text-sm leading-6 text-(--color-muted)">
              We’ll send the confirmation link to{" "}
              <span className="break-all font-medium text-(--color-ink)">
                {newEmail.trim()}
              </span>
              .
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted)">
              Current password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              minLength={8}
              maxLength={72}
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-[0.7rem] border border-(--color-line) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus:border-(--color-accent) focus:outline-none disabled:opacity-60"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-[0.8rem] border border-(--color-negative-line) bg-(--color-negative-soft) px-4 py-3 text-sm text-(--color-negative-strong)"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 rounded-[0.65rem] border border-(--color-ink) bg-(--color-ink) px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-surface) transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Confirm email change"}
            </button>
            <button
              type="button"
              onClick={cancelPasswordModal}
              disabled={isSubmitting}
              className="min-h-11 rounded-[0.65rem] border border-(--color-line) px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted) transition-colors hover:border-(--color-ink) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
