"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { authenticate } from "@/features/auth/api/authenticate";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthModeTabs } from "@/features/auth/components/auth-mode-tabs";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { LoginFormFields } from "@/features/auth/components/login-form-fields";
import type { AuthMode, AuthPayload } from "@/features/auth/types";
import { requestPasswordReset } from "@/features/auth/api/request-password-reset";
import {
  getPasswordResetFailure,
  removePasswordResetFailureFromUrl,
} from "@/features/auth/utils/password-reset-feedback";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordResetFail, setIsPasswordResetFail] = useState(false);
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);

  const isRegistering = mode === "register";
  const isPasswordResetting = mode === "password-reset";

  useEffect(() => {
    if (!getPasswordResetFailure(window.location.search)) {
      return;
    }

    // Consume the one-time redirect query parameter.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPasswordResetFail(true);

    const timeout = window.setTimeout(() => {
      setIsPasswordResetFail(false);
      window.history.replaceState(
        window.history.state,
        "",
        removePasswordResetFailureFromUrl(window.location.href),
      );
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, []);

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) {
      return;
    }

    const commit = () => {
      setMode(nextMode);
      setErrorMessage("");
      setIsPasswordResetSent(false);
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      commit();
      return;
    }

    document.startViewTransition(() => {
      flushSync(commit);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      if (isPasswordResetting) {
        const email = String(formData.get("email") ?? "").trim();
        await requestPasswordReset(email);
        setIsPasswordResetSent(true);
        return;
      }

      const payload: AuthPayload = isRegistering
        ? {
            username: String(formData.get("username") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            password: String(formData.get("password") ?? ""),
            currency: String(formData.get("currency") ?? "MGA").trim(),
          }
        : {
            email: String(formData.get("email") ?? "").trim(),
            password: String(formData.get("password") ?? ""),
          };

      await authenticate(mode, payload);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not complete that request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {isPasswordResetFail && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-5 border border-[var(--color-negative-line)] bg-[var(--color-negative-soft)] p-5"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-12 w-12 shrink-0 text-[var(--color-negative)]"
          >
            <circle cx="24" cy="24" r="22" fill="currentColor" />
            <path
              d="m17 17 14 14m0-14L17 31"
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>
          <p className="text-sm font-medium leading-6 text-[var(--color-negative-strong)]">
            This password reset link is invalid or has expired. Request a new
            one to try again.
          </p>
        </div>
      )}
      <AuthHeading mode={mode} />
      {!isPasswordResetting && (
        <AuthModeTabs mode={mode} onModeChange={switchMode} />
      )}
      {isPasswordResetSent ? (
        <div className="space-y-5">
          <p
            role="status"
            className="border-l-4 border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-ink)]"
          >
            If an account exists for that email, we’ll send password reset
            instructions shortly.
          </p>
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="min-h-11 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <LoginFormFields mode={mode} />
          {!isRegistering && !isPasswordResetting && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("password-reset")}
                className="min-h-8 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Forgot password?
              </button>
            </div>
          )}
          <AuthError message={errorMessage} />
          <AuthSubmitButton
            isSubmitting={isSubmitting}
            mode={mode}
          />
          {isPasswordResetting && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="min-h-8 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Back to sign in
              </button>
            </div>
          )}
        </form>
      )}
    </>
  );
}
