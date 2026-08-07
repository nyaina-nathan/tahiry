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
      className="border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-4 py-3 text-sm leading-6 text-[#9d2020]"
    >
      {message}
    </div>
  );
}
