"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authenticate } from "@/features/auth/api/authenticate";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthModeTabs } from "@/features/auth/components/auth-mode-tabs";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { LoginFormFields } from "@/features/auth/components/login-form-fields";
import type { AuthMode, AuthPayload } from "@/features/auth/types";
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

  const isRegistering = mode === "register";

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
    setMode(nextMode);
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
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

    try {
      await authenticate(mode, payload);
      router.replace("/");
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
      <AuthModeTabs mode={mode} onModeChange={switchMode} />
      <form className="space-y-5" onSubmit={handleSubmit}>
        <LoginFormFields isRegistering={isRegistering} />
        <AuthError message={errorMessage} />
        <AuthSubmitButton
          isSubmitting={isSubmitting}
          isRegistering={isRegistering}
        />
      </form>
    </>
  );
}
