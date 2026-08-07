export type CategoryType = "EXPENSE" | "INCOME";

export type Category = {
  id: string;
  id_user: string;
  cat_type: CategoryType;
  cat_name: string;
};

export type CategoryInput = {
  cat_type?: CategoryType;
  cat_name: string;
};

export type CategoryPatch = {
  cat_type?: CategoryType;
  cat_name?: string;
};
