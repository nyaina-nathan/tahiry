import { prisma } from "@/libs/db/prisma";

export { prisma };

const TABLES = [
  "money_movements",
  "categories",
  "account",
  "weekly_reminder",
  "password_reset_token",
  "users",
] as const;

export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.join(", ")} RESTART IDENTITY CASCADE`,
  );
}
