import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import type { TestProject } from "vitest/node";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "docs/db");

const MIGRATIONS = [
  "v1_1__db_init.sql",
  "V2_1__account_table.sql",
  "V3_1__weekly_reminder_table.sql",
  "V4_1_email_change.sql",
  "V5_1_forgot_password.sql",
] as const;

async function assertMigrationsAreComplete(): Promise<void> {
  const files = await readdir(MIGRATIONS_DIR);
  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();
  const unregistered = sqlFiles.filter(
    (file) => !(MIGRATIONS as readonly string[]).includes(file),
  );
  const missing = MIGRATIONS.filter((file) => !sqlFiles.includes(file));

  if (unregistered.length > 0) {
    throw new Error(
      `Unregistered SQL migration(s) in docs/db: ${unregistered.join(", ")}. Add them to tests/integration/global-setup.ts in order.`,
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing SQL migration(s) in docs/db: ${missing.join(", ")}.`,
    );
  }
}

async function applyMigrations(connectionString: string): Promise<void> {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    await client.query("BEGIN");

    for (const migration of MIGRATIONS) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, migration), "utf8");
      await client.query(sql);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

export default async function setup(project: TestProject) {
  await assertMigrationsAreComplete();

  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("tahiry_test")
    .withUsername("tahiry")
    .withPassword("tahiry")
    .withStartupTimeout(120_000)
    .start();

  const connectionString = container.getConnectionUri();

  try {
    await applyMigrations(connectionString);
  } catch (error) {
    await container.stop();
    throw error;
  }

  project.provide("databaseUrl", connectionString);
  process.env.DATABASE_URL = connectionString;

  return async () => {
    await container.stop();
  };
}
