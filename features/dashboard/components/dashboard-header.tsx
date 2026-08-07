import Link from "next/link";

type DashboardHeaderProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function DashboardHeader({
  isLoggingOut,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
        >
          <span className="flex h-9 w-9 items-center justify-center bg-[var(--color-primary)] font-mono text-base font-bold text-white">
            P
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">
            Pennywise
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-4 sm:gap-6"
        >
          <Link
            href="/categories"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
          >
            Categories
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </nav>
      </div>
    </header>
  );
}
