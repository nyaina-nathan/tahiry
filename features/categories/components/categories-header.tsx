import Link from "next/link";

export function CategoriesHeader() {
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
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
        <Link
          href="/"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
        >
          Back to overview
        </Link>
      </div>
    </header>
  );
}
