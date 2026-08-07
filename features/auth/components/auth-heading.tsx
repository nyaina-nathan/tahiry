import type { AuthMode } from "@/features/auth/types";

type AuthHeadingProps = {
  mode: AuthMode;
};

export function AuthHeading({ mode }: AuthHeadingProps) {
  const isRegistering = mode === "register";

  return (
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
  );
}
