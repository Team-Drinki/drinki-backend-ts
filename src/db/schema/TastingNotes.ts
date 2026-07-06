import { pgTable, text, integer, jsonb, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";
import { alcohols } from "./Alcohols";

export const tastingNotes = pgTable("tasting_notes", {
  id: serial("id").primaryKey(),
  alcoholId: integer("alcohol_id")
    .references(() => alcohols.id),
  customAlcoholName: text("custom_alcohol_name", { length: 255 }),
  customAlcoholCategory: text("custom_alcohol_category", { length: 100 }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  images: jsonb("images").notNull().$type<string[]>().default([]),
  aromaNote: jsonb("aroma_note").notNull(),
  palateNote: jsonb("palate_note").notNull(),
  finishNote: jsonb("finish_note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  viewCount: integer("view_count").notNull().default(0),
});

export type TastingNote = typeof tastingNotes.$inferSelect; // 조회용
export type NewTastingNote = typeof tastingNotes.$inferInsert; // 생성용
export type UpdateTastingNote = Partial<
  Omit<TastingNote, "id" | "createdAt" | "userId">
>; // 수정용
