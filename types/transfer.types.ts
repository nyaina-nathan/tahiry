export type TransferInput = {
  id_account_source: string;
  id_account: string;
  amount: string;
  title?: string;
  description?: string | null;
  logged_for?: string | null;
  logged_at?: string | null;
};
