"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { AuthBackground } from "@/features/auth/components/auth-background";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthField } from "@/features/auth/components/auth-field";
import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthMobileBrand } from "@/features/auth/components/auth-mobile-brand";
import { AuthSecurityNote } from "@/features/auth/components/auth-security-note";
import { changePassword } from "@/features/auth/api/password-reset-change";
import { getPasswordConfirmationError } from "@/features/auth/utils/password-confirmation";

type PasswordChangeScreenProps = {
  token: string | null;
};

export function PasswordChangeScreen({ token }: PasswordChangeScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const passwordConfirmationError = getPasswordConfirmationError(
      newPassword,
      confirmPassword,
    );
    if (passwordConfirmationError) {
      setErrorMessage(passwordConfirmationError);
      return;
    }

    if (!token) {
      setErrorMessage("This password reset link is invalid or expired.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(token, newPassword);
      setIsSuccess(true);
      window.history.replaceState(window.history.state, "", "/password-change");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not update your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--color-canvas)]">
      <AuthBackground />
      <AuthHero />

      <section className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[56%] lg:px-12">
        <div className="w-full max-w-[460px]">
          <AuthMobileBrand />
          <div className="mb-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Password reset
            </p>
            <h1 className="font-bold text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-6xl">
              Choose a new password.
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--color-muted)]">
              Use at least 8 characters, then enter it again to confirm.
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-5">
              <p
                role="status"
                className="border-l-4 border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-ink)]"
              >
                Your password has been changed. You can now sign in.
              </p>
              <Link
                href="/login"
                className="flex min-h-14 w-full items-center justify-between bg-[var(--color-strong)] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              >
                <span>Return to sign in</span>
                <span aria-hidden="true" className="text-xl">
                  -&gt;
                </span>
              </Link>
            </div>
          ) : token ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <AuthField
                id="newPassword"
                name="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                placeholder="Enter a new password"
              />
              <AuthField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                placeholder="Enter it again"
              />
              <AuthError message={errorMessage} />
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex min-h-14 w-full items-center justify-between overflow-hidden bg-[var(--color-strong)] px-5 text-left text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-contrast)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:cursor-wait disabled:opacity-60"
              >
                <span>
                  {isSubmitting ? "Saving..." : "Save new password"}
                </span>
                <span
                  aria-hidden="true"
                  className="text-xl transition-transform group-hover:translate-x-1"
                >
                  -&gt;
                </span>
              </button>
              <p className="text-center text-sm text-[var(--color-muted)]">
                Remembered your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              <p
                role="alert"
                className="border-l-4 border-[var(--color-negative)] bg-[var(--color-negative-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-negative-strong)]"
              >
                This reset link is missing its token. Request a new password
                reset link to try again.
              </p>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              >
                Return to sign in
              </Link>
            </div>
          )}

          <AuthSecurityNote />
        </div>
      </section>
    </main>
  );
}
