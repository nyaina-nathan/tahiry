import { AuthBrand } from "@/features/auth/components/auth-brand";

export function AuthHero() {
  return (
    <section className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-[var(--color-strong)] p-10 text-white lg:flex xl:p-14">
      <div
        aria-hidden="true"
        className="absolute -right-20 top-24 h-72 w-72 rounded-full border-[42px] border-[var(--color-accent-inverse)] opacity-80"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-20 h-80 w-80 rotate-12 border-[42px] border-[var(--color-accent-inverse)] opacity-80"
      />

      <AuthBrand className="relative z-10" />

      <div className="relative z-10 max-w-md">
        <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.28em] text-[var(--color-accent-inverse)]">
          Money, made visible
        </p>
        <h1 className="font-display text-6xl leading-[0.95] tracking-tight xl:text-7xl">
          Make every coin count.
        </h1>
        <p className="mt-8 max-w-sm text-base leading-7 text-[var(--color-strong-muted)]">
          A clearer view of your spending, income, and the small choices that
          shape your everyday life.
        </p>
      </div>

      <p className="relative z-10 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-strong-faint)]">
        Your money. Your rules.
      </p>
    </section>
  );
}
