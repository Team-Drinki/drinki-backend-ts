import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";

import { flavorCategories } from "./FlavorCategories";

export const flavorKeywords = pgTable("flavor_keywords", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => flavorCategories.id),
  name: text("name").notNull(),
});

export type FlavorKeyword = typeof flavorKeywords.$inferSelect; // 조회용
export type NewFlavorKeyword = typeof flavorKeywords.$inferInsert; // 생성용
export type UpdateFlavorKeyword = Partial<Omit<FlavorKeyword, "id">>; // 수정용
