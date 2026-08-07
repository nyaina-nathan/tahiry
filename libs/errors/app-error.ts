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
