import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const alcoholLocations = pgTable("alcohol_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export type AlcoholLocation = typeof alcoholLocations.$inferSelect; // 조회용
export type NewAlcoholLocation = typeof alcoholLocations.$inferInsert; // 생성용
export type UpdateAlcoholLocation = Partial<Omit<AlcoholLocation, "id">>; // 수정용
