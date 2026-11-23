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
    <div className="mb-10 flex flex-col gap-6 border-b border-(--color-line) pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-5xl leading-none tracking-tight text-(--color-ink) sm:text-7xl">
          Your categories.
        </h1>
      </div>
      <div className="flex items-end gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-(--color-muted) sm:text-right">
        <div>
          <span className="block text-3xl font-bold tracking-normal text-(--color-ink)">
            {categoryCount.toString().padStart(2, "0")}
          </span>
          categories total
        </div>
        <button
          type="button"
          onClick={onCreateCategory}
          aria-expanded={isCreateFormOpen}
          aria-controls="create-category-form"
          className="flex min-h-10 items-center justify-between gap-5 rounded-[0.65rem] border border-(--color-line) px-3 text-(--color-ink) transition-colors hover:border-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
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
