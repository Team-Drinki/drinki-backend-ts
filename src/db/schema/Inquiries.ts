import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  isSecret: boolean("is_secret").notNull().default(false),
  title: text("title").notNull(),
  content: text("content").notNull(),
  answer: text("answer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Inquiry = typeof inquiries.$inferSelect; // 조회용
export type NewInquiry = typeof inquiries.$inferInsert; // 생성용
export type UpdateInquiry = Partial<
  Omit<Inquiry, "id" | "userId" | "createdAt">
>; // 수정용
