import type { AuthMode } from "@/features/auth/types";

type AuthHeadingProps = {
  mode: AuthMode;
};

export function AuthHeading({ mode }: AuthHeadingProps) {
  const isRegistering = mode === "register";
  const isPasswordResetting = mode === "password-reset";

  return (
    <div className="mb-8">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
        {isRegistering
          ? "New account"
          : isPasswordResetting
            ? "Password reset"
            : "Personal finance"}
      </p>
      <h2 className="font-bold text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-6xl">
        {isRegistering
          ? "Start fresh."
          : isPasswordResetting
            ? "Forgot your password?"
            : "Welcome back."}
      </h2>
      <p className="mt-5 text-base leading-7 text-[var(--color-muted)]">
        {isRegistering
          ? "Set up your account and take control of the numbers."
          : isPasswordResetting
            ? "Enter your email and we’ll send password reset instructions if an account exists."
            : "Sign in to pick up where you left off."}
      </p>
    </div>
  );
}
