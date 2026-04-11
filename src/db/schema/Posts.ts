import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  category: text("category", {
    enum: ["FREE", "QUESTION", "FAQ", "NOTICE"],
  }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect; // 조회용
export type NewPost = typeof posts.$inferInsert; // 생성용
export type UpdatePost = Partial<Omit<Post, "id" | "createdAt" | "userId">>; // 수정용
