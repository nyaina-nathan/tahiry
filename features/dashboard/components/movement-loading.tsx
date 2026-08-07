export function MovementLoading() {
  return (
    <div className="space-y-3" aria-label="Loading money movements">
      {["one", "two", "three"].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse border border-[var(--color-line)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
