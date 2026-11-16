type AuthErrorProps = {
  message: string;
};

export function AuthError({ message }: AuthErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="border-l-4 border-[var(--color-negative)] bg-[var(--color-negative-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-negative-strong)]"
    >
      {message}
    </div>
  );
}
