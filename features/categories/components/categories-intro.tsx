type CategoriesIntroProps = {
  categoryCount: number;
};

export function CategoriesIntro({ categoryCount }: CategoriesIntroProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 border-b border-[var(--color-line)] pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
          Organize the numbers
        </p>
        <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-7xl">
          Your categories.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          Shape the labels that keep your money organized. Create the structure
          that makes every movement easier to understand.
        </p>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] sm:text-right">
        <span className="block text-3xl font-bold tracking-normal text-[var(--color-ink)]">
          {categoryCount.toString().padStart(2, "0")}
        </span>
        categories total
      </div>
    </div>
  );
}
