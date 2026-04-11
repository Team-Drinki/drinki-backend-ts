import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const alcoholCategories = pgTable("alcohol_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export type AlcoholCategory = typeof alcoholCategories.$inferSelect; // 조회용
export type NewAlcoholCategory = typeof alcoholCategories.$inferInsert; // 생성용
export type UpdateAlcoholCategory = Partial<Omit<AlcoholCategory, "id">>; // 수정용
