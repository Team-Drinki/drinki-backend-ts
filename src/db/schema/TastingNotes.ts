import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { users } from "./Users";
import { alcohols } from "./Alcohols";

export const tastingNotes = sqliteTable("tasting_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  alcoholId: integer("alcohol_id")
    .references(() => alcohols.id),
  customAlcoholName: text("custom_alcohol_name", { length: 255 }),
  customAlcoholCategory: text("custom_alcohol_category", { length: 100 }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title", { length: 255 }).notNull(),
  content: text("content"),
  images: text("images", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`('[]')`),
  aromaNote: text("aroma_note", { mode: "json" }).notNull(), // JSON stored as text
  palateNote: text("palate_note", { mode: "json" }).notNull(),
  finishNote: text("finish_note", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  viewCount: integer("view_count").notNull().default(0),
});

export type TastingNote = typeof tastingNotes.$inferSelect; // 조회용
export type NewTastingNote = typeof tastingNotes.$inferInsert; // 생성용
export type UpdateTastingNote = Partial<
  Omit<TastingNote, "id" | "createdAt" | "userId">
>; // 수정용
