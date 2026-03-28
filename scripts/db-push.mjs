// Loads .env before running drizzle-kit push, so DATABASE_URL is available.
// Usage: node scripts/db-push.mjs
import { config } from "dotenv";
import { execSync } from "child_process";

config(); // silently skips if .env doesn't exist

execSync("npx drizzle-kit push", { stdio: "inherit" });
