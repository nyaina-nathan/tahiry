export type Account = {
  id: string;
  id_user: string;
  name: string;
  created_at: string | null;
};

export type AccountInput = {
  name: string;
};

export type AccountPatch = {
  name?: string;
};
