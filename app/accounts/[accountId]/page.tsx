import { AccountDetailPage } from "@/features/accounts/components/account-detail-page";

type AccountDetailRouteProps = {
  params: Promise<{ accountId: string }>;
};

export default async function AccountDetailRoute({
  params,
}: AccountDetailRouteProps) {
  const { accountId } = await params;

  return <AccountDetailPage accountId={accountId} />;
}
