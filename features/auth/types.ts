export type AuthMode = "login" | "register" | "password-reset";
export type CredentialsAuthMode = Exclude<AuthMode, "password-reset">;

export type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  username: string;
  currency: string;
};

export type AuthPayload = LoginPayload | RegisterPayload;
