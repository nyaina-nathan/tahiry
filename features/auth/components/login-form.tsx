"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authenticate } from "@/features/auth/api/authenticate";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthModeTabs } from "@/features/auth/components/auth-mode-tabs";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { LoginFormFields } from "@/features/auth/components/login-form-fields";
import type { AuthMode, AuthPayload } from "@/features/auth/types";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isRegistering = mode === "register";

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
