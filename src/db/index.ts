import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDatabase(connectionString: string) {
  return drizzle(neon(connectionString), { schema });
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDb() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required. Add your Neon PostgreSQL connection string to .env.local.");
  }
  if (!connectionString.startsWith("postgres://") && !connectionString.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string from Neon.");
  }

  database ??= createDatabase(connectionString);
  return database;
}
