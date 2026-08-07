export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  currency: true,
  created_at: true,
} as const;

type PublicUser = {
  id: string;
  username: string;
  email: string;
  currency: string;
  created_at: Date | null;
};

export type AuthResult = {
  user: PublicUser;
  token: string;
};
