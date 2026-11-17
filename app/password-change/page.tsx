import { PasswordChangeScreen } from "@/features/auth/components/password-change-screen";

type PasswordChangePageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function PasswordChangePage({
  searchParams,
}: PasswordChangePageProps) {
  const { token } = await searchParams;

  return (
    <PasswordChangeScreen
      token={typeof token === "string" ? token : null}
    />
  );
}
