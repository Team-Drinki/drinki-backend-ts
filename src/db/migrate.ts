import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../plugins/database";

console.log("🚀 Starting migration...");

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migration completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
