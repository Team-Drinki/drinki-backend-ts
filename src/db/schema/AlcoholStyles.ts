import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";

import { alcoholCategories } from "./AlcoholCategories";

export const alcoholStyles = pgTable("alcohol_styles", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => alcoholCategories.id),
  name: text("name").notNull(),
});

export type AlcoholStyle = typeof alcoholStyles.$inferSelect; // 조회용
export type NewAlcoholStyle = typeof alcoholStyles.$inferInsert; // 생성용
export type UpdateAlcoholStyle = Partial<Omit<AlcoholStyle, "id">>; // 수정용
