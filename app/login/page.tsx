"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export default function LoginPage() {
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
    const payload = isRegistering
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
      const response = await fetch(
        isRegistering ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | ApiErrorResponse
          | null;
        throw new Error(
          data?.error?.message ?? "We could not complete that request.",
        );
      }

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
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--color-canvas)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-[var(--color-secondary)] opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[var(--color-primary)] opacity-20 blur-3xl"
      />

      <section className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-[var(--color-ink)] p-10 text-white lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="absolute -right-20 top-24 h-72 w-72 rounded-full border-[42px] border-[var(--color-primary)] opacity-80"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 h-80 w-80 rotate-12 border-[42px] border-[var(--color-secondary)] opacity-80"
        />

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center bg-[var(--color-primary)] font-mono text-lg font-bold text-white">
            P
          </span>
          <span className="font-mono text-sm font-bold uppercase tracking-[0.24em]">
            Pennywise
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#aebeff]">
            Money, made visible
          </p>
          <h1 className="font-display text-6xl leading-[0.95] tracking-tight xl:text-7xl">
            Make every coin count.
          </h1>
          <p className="mt-8 max-w-sm text-base leading-7 text-[#c8ccd7]">
            A clearer view of your spending, income, and the small choices that
            shape your everyday life.
          </p>
        </div>

        <p className="relative z-10 font-mono text-xs uppercase tracking-[0.2em] text-[#8d94a5]">
          Your money. Your rules.
        </p>
      </section>

      <section className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[56%] lg:px-12">
        <div className="w-full max-w-[460px]">
          <div className="mb-10 lg:hidden">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-[var(--color-primary)] font-mono text-lg font-bold text-white">
                P
              </span>
              <span className="font-mono text-sm font-bold uppercase tracking-[0.24em]">
                Pennywise
              </span>
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
              Your money. Your rules.
            </p>
          </div>

          <div className="mb-8">
            <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              {isRegistering ? "New account" : "Personal finance"}
            </p>
            <h2 className="font-display text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-6xl">
              {isRegistering ? "Start fresh." : "Welcome back."}
            </h2>
            <p className="mt-5 text-base leading-7 text-[var(--color-muted)]">
              {isRegistering
                ? "Set up your account and take control of the numbers."
                : "Sign in to pick up where you left off."}
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 border-b border-[var(--color-line)]">
            <button
              type="button"
              onClick={() => switchMode("login")}
              aria-pressed={!isRegistering}
              className={`min-h-12 border-b-2 px-2 pb-3 text-left font-mono text-xs font-bold uppercase tracking-[0.15em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] ${
                !isRegistering
                  ? "border-[var(--color-primary)] text-[var(--color-ink)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              aria-pressed={isRegistering}
              className={`min-h-12 border-b-2 px-2 pb-3 text-left font-mono text-xs font-bold uppercase tracking-[0.15em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] ${
                isRegistering
                  ? "border-[var(--color-primary)] text-[var(--color-ink)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Register
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label
                  className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  maxLength={255}
                  className="min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="What should we call you?"
                />
              </div>
            )}

            <div>
              <label
                className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                className="min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  className="block font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                  htmlFor="password"
                >
                  Password
                </label>
                {isRegistering && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                    8 characters minimum
                  </span>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                minLength={isRegistering ? 8 : undefined}
                maxLength={isRegistering ? 72 : undefined}
                className="min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="Enter your password"
              />
            </div>

            {isRegistering && (
              <div>
                <label
                  className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                  htmlFor="currency"
                >
                  Currency
                </label>
                <input
                  id="currency"
                  name="currency"
                  type="text"
                  defaultValue="MGA"
                  autoComplete="country-currency"
                  required
                  maxLength={20}
                  className="min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base uppercase outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="MGA"
                />
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-4 py-3 text-sm leading-6 text-[#9d2020]"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex min-h-14 w-full items-center justify-between overflow-hidden bg-[var(--color-ink)] px-5 text-left font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait disabled:opacity-60"
            >
              <span>{isSubmitting ? "Working..." : isRegistering ? "Create account" : "Sign in"}</span>
              <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">
                -&gt;
              </span>
            </button>
          </form>

          <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.13em] text-[var(--color-muted)]">
            Secure session protected by Pennywise
          </p>
        </div>
      </section>
    </main>
  );
}
