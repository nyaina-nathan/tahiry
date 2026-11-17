import type { AuthMode } from "@/features/auth/types";

type AuthSubmitButtonProps = {
  isSubmitting: boolean;
  mode: AuthMode;
};

export function AuthSubmitButton({
  isSubmitting,
  mode,
}: AuthSubmitButtonProps) {
  const label =
    mode === "register"
      ? "Create account"
      : mode === "password-reset"
        ? "Send reset link"
        : "Sign in";

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="group relative flex min-h-14 w-full items-center justify-between overflow-hidden bg-[var(--color-strong)] px-5 text-left font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-contrast)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:cursor-wait disabled:opacity-60"
    >
      <span>
        {isSubmitting ? "Working..." : label}
      </span>
      <span
        aria-hidden="true"
        className="text-xl transition-transform group-hover:translate-x-1"
      >
        -&gt;
      </span>
    </button>
  );
}
