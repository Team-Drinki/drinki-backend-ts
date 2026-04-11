import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  targetType: text("target_type", {
    enum: ["post", "tasting_note", "alcohol"],
  }).notNull(),
  targetId: integer("target_id").notNull(),
  parentId: integer("parent_id").references((): any => comments.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type Comment = typeof comments.$inferSelect; // 조회용
export type NewComment = typeof comments.$inferInsert; // 생성용
export type UpdateComment = Partial<
  Omit<
    Comment,
    "id" | "userId" | "targetType" | "targetId" | "parentId" | "createdAt"
  >
>; // 수정용
