import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "../plugins/database";

console.log("🚀 Starting migration...");

try {
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migration completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
