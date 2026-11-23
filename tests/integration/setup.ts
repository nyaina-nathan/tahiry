import { afterAll, inject } from "vitest";

function getDatabaseUrl(): string {
  try {
    return inject("databaseUrl");
  } catch {
    const fallback = process.env.DATABASE_URL;

    if (!fallback) {
      throw new Error(
        "The integration database URL was not provided by global setup.",
      );
    }

    return fallback;
  }
}

process.env.DATABASE_URL = getDatabaseUrl();
process.env.JWT_SECRET = "integration-test-jwt-secret";
process.env.APP_URL = "http://localhost:3000";
process.env.RESEND_API_KEY = "re_integration_test";
process.env.EMAIL_FROM = "noreply@example.com";

afterAll(async () => {
  const { prisma } = await import("@/libs/db/prisma");
  await prisma.$disconnect();
});
