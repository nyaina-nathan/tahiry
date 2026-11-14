type CategoriesIntroProps = {
  categoryCount: number;
  onCreateCategory: () => void;
  isCreateFormOpen: boolean;
};

export function CategoriesIntro({
  categoryCount,
  onCreateCategory,
  isCreateFormOpen,
}: CategoriesIntroProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 border-b border-[var(--color-line)] pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-7xl">
          Your categories.
        </h1>
      </div>
      <div className="flex items-end gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] sm:text-right">
        <div>
          <span className="block text-3xl font-bold tracking-normal text-[var(--color-ink)]">
            {categoryCount.toString().padStart(2, "0")}
          </span>
          categories total
        </div>
        <button
          type="button"
          onClick={onCreateCategory}
          aria-expanded={isCreateFormOpen}
          aria-controls="create-category-form"
          className="flex min-h-10 items-center justify-between gap-5 border border-[var(--color-line)] px-3 text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
        >
          <span>Create category</span>
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
        </button>
      </div>
    </div>
  );
}
