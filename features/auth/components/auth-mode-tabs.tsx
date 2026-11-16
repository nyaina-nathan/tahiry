import type { AuthMode } from "@/features/auth/types";

type AuthModeTabsProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthModeTabs({ mode, onModeChange }: AuthModeTabsProps) {
  const isRegistering = mode === "register";

  return (
    <div className="mb-7 grid grid-cols-2 border-b border-[var(--color-line)]">
      <button
        type="button"
        onClick={() => onModeChange("login")}
        aria-pressed={!isRegistering}
        className={`min-h-12 border-b-2 px-2 pb-3 text-left font-mono text-xs font-bold uppercase tracking-[0.15em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] ${
          !isRegistering
            ? "border-[var(--color-accent)] text-[var(--color-ink)]"
            : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onModeChange("register")}
        aria-pressed={isRegistering}
        className={`min-h-12 border-b-2 px-2 pb-3 text-left font-mono text-xs font-bold uppercase tracking-[0.15em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] ${
          isRegistering
            ? "border-[var(--color-accent)] text-[var(--color-ink)]"
            : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        Register
      </button>
    </div>
  );
}
