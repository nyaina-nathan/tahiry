export type MovementType = "EXPENSE" | "INCOME";

export type MoneyMovement = {
  id: string;
  id_user: string;
  id_category: string | null;
  movement_type: MovementType;
  title: string;
  description: string | null;
  amount: string;
  logged_for: string | null;
  logged_at: string | null;
};

export type MovementInput = {
  id_category?: string | null;
  movement_type?: MovementType;
  title: string;
  description?: string | null;
  amount: string;
  logged_for?: string | null;
  logged_at?: string | null;
};

export type MovementPatch = {
  id_category?: string | null;
  movement_type?: MovementType;
  title?: string;
  description?: string | null;
  amount?: string;
  logged_for?: string | null;
  logged_at?: string | null;
};

export type MovementFilters = {
  movementType?: MovementType;
  categoryId?: string;
  loggedForFrom?: string;
  loggedForTo?: string;
  page: number;
  pageSize: number;
};

export type MovementPage = {
  items: MoneyMovement[];
  page: number;
  page_size: number;
  total: number;
};
