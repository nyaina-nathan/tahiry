export class AppError extends Error {
  readonly title: string;
  readonly status: number;
  readonly origin: string;

  constructor(title: string, message: string, status: number, origin: string) {
    super(message);

    this.name = "AppError";
    this.title = title;
    this.status = status;
    this.origin = origin;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export function duplicateEmailError(): AppError {
  return new AppError(
    "Conflict",
    "Email is already registered.",
    409,
    "authentication",
  );
}

export function invalidCredentialsError(): AppError {
  return new AppError(
    "Unauthorized",
    "Invalid email or password.",
    401,
    "authentication",
  );
}