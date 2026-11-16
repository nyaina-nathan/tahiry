export function AuthBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-[var(--color-accent)] opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[var(--color-accent)] opacity-20 blur-3xl"
      />
    </>
  );
}
