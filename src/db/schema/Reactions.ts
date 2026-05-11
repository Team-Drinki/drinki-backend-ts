import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { users } from "./Users";

export const reactions = sqliteTable(
  "reactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    targetId: integer("target_id").notNull(),
    targetType: text("target_type", {
      enum: ["post", "comment", "alcohol", "tasting_note"],
    }).notNull(),
    reactionType: text("reaction_type", { enum: ["like", "unlike"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    uniqUserTargetReaction: uniqueIndex("reactions_user_target_type_unique").on(
      table.userId,
      table.targetId,
      table.targetType,
      table.reactionType,
    ),
  }),
);

export type Reaction = typeof reactions.$inferSelect; // 조회용
export type NewReaction = typeof reactions.$inferInsert; // 생성용
