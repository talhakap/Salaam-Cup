import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

let databaseUrl = (process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || "").replace(/\\n/g, "").trim();

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set.",
  );
}

if (databaseUrl.includes("pooler.supabase.com:6543")) {
  databaseUrl = databaseUrl.replace(":6543/", ":5432/");
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
