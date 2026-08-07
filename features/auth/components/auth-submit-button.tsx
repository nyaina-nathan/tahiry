type AuthSubmitButtonProps = {
  isSubmitting: boolean;
  isRegistering: boolean;
};

export function AuthSubmitButton({
  isSubmitting,
  isRegistering,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="group relative flex min-h-14 w-full items-center justify-between overflow-hidden bg-[var(--color-ink)] px-5 text-left font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait disabled:opacity-60"
    >
      <span>
        {isSubmitting ? "Working..." : isRegistering ? "Create account" : "Sign in"}
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
