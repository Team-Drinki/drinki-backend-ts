import { pgTable, integer, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";
import { alcohols } from "./Alcohols";

export const wishes = pgTable("wishes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  alcoholId: integer("alcohol_id")
    .notNull()
    .references(() => alcohols.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Wish = typeof wishes.$inferSelect; // 조회용
export type NewWish = typeof wishes.$inferInsert; // 생성용
