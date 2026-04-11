import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const flavorCategories = pgTable("flavor_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export type FlavorCategory = typeof flavorCategories.$inferSelect; // 조회용
export type NewFlavorCategory = typeof flavorCategories.$inferInsert; // 생성용
export type UpdateFlavorCategory = Partial<Omit<FlavorCategory, "id">>; // 수정용
