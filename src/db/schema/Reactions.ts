import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  targetId: integer("target_id").notNull(),
  targetType: text("target_type", {
    enum: ["post", "comment", "alcohol", "tasting_note"],
  }).notNull(),
  reactionType: text("reaction_type", { enum: ["like", "unlike"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Reaction = typeof reactions.$inferSelect; // 조회용
export type NewReaction = typeof reactions.$inferInsert; // 생성용
