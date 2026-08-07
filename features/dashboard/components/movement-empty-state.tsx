export function MovementEmptyState() {
  return (
    <div className="border border-dashed border-[var(--color-line)] px-6 py-14 text-center">
      <p className="font-display text-3xl text-[var(--color-ink)]">
        No movements yet.
      </p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
        Add a movement to see your financial picture take shape.
      </p>
    </div>
  );
}
