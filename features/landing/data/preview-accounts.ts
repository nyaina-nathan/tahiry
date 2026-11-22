export const PREVIEW_CURRENCY = "MGA";

export type PreviewAccount = {
  id: string;
  name: string;
  label: string;
  balance: string;
  income: string;
  expense: string;
  digits: string;
};

export const PREVIEW_ACCOUNTS: PreviewAccount[] = [
  {
    id: "everyday",
    name: "Everyday Cash",
    label: "Personal account",
    balance: "2450000",
    income: "4200000",
    expense: "1750000",
    digits: "2847",
  },
  {
    id: "savings",
    name: "Savings",
    label: "Savings account",
    balance: "5800000",
    income: "1200000",
    expense: "0",
    digits: "1093",
  },
  {
    id: "side-stash",
    name: "Side Stash",
    label: "Flexible savings",
    balance: "640000",
    income: "320000",
    expense: "140000",
    digits: "7714",
  },
  {
    id: "travel-fund",
    name: "Travel Fund",
    label: "Goal account",
    balance: "1150000",
    income: "500000",
    expense: "85000",
    digits: "4520",
  },
];
