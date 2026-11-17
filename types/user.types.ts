export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  currency: string;
  created_at: string | null;
};

export type UserPatch = {
  username?: string;
  currency?: string;
};
