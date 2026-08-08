import type { Category } from "@/types/category.types";
import type { Balance } from "@/types/balance.types";
import type {
  MovementPage,
  MovementType,
} from "@/types/money-movement.types";

export type CurrentUser = {
  currency: string;
  username: string;
};

export type Filters = {
  movementType: MovementType | "ALL";
  categoryId: string;
  loggedForFrom: string;
  loggedForTo: string;
  page: number;
};

export type Mutation = "create" | "update" | "delete" | null;

export type DashboardData = {
  currentUser: CurrentUser;
  currentBalance: Balance;
  currentCategories: Category[];
  currentMovements: MovementPage;
};

export type MovementFormState = {
  type: MovementType;
  title: string;
  amount: string;
  categoryId: string;
  description: string;
  loggedFor: string;
};
