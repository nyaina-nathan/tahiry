import type { CurrentUser } from "@/features/dashboard/types";

type DashboardIntroProps = {
  user: CurrentUser;
};

export function DashboardIntro({ user }: DashboardIntroProps) {
  return (
    <section className="mb-10 flex flex-col gap-6 border-b border-[var(--color-line)] pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
          Personal money desk
        </p>
        <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-7xl">
          Your money, in motion.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          Welcome, {user.username}. Keep the full picture close and the next
          decision clear.
        </p>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)] sm:text-right">
        Currency
        <span className="mt-2 block text-2xl font-bold tracking-normal text-[var(--color-ink)]">
          {user.currency}
        </span>
      </p>
    </section>
  );
}
