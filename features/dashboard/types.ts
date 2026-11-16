import type { MovementType } from "@/types/money-movement.types";

export type CurrentUser = {
  currency: string;
  username: string;
};

export type Filters = {
  movementType: MovementType | "ALL";
  categoryId: string;
  accountId?: string;
  loggedForFrom: string;
  loggedForTo: string;
  page: number;
  pageSize: number;
};

export type Mutation = "create" | "update" | "delete" | null;

export type CashflowPoint = {
  date: string;
  income: number;
  expense: number;
};

export type MovementFormState = {
  type: MovementType;
  title: string;
  amount: string;
  categoryId: string;
  description: string;
  loggedFor: string;
};
