type MovementEmptyStateProps = {
  title?: string;
  description?: string;
};

export function MovementEmptyState({
  title = "No movements yet.",
  description = "Add a movement to see your financial picture take shape.",
}: MovementEmptyStateProps = {}) {
  return (
    <div className="dash-panel dash-panel-dashed px-6 py-14 text-center">
      <p className="font-display text-3xl text-[var(--color-ink)]">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
        {description}
      </p>
    </div>
  );
}
