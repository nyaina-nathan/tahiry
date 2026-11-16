export type AccountBalance = {
  id_account: string;
  name: string;
  income: string;
  expense: string;
  balance: string;
};

export type Balance = {
  income: string;
  expense: string;
  balance: string;
  accounts: AccountBalance[];
};
