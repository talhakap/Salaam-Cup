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

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export async function fixSequences() {
  const tables = ['awards', 'news', 'sponsors', 'faqs', 'venues', 'special_awards', 'media_years', 'media_cards', 'tournaments', 'divisions', 'teams', 'players', 'matches', 'sports'];
  for (const table of tables) {
    try {
      await pool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`);
    } catch (_) {}
  }
  console.log("Database sequences synchronized");
}
