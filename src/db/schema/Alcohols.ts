import { pgTable, text, integer, real, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";
import { alcoholCategories } from "./AlcoholCategories";
import { alcoholStyles } from "./AlcoholStyles";
import { alcoholLocations } from "./AlcoholLocations";

export const alcohols = pgTable("alcohols", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  categoryId: integer("category_id")
    .notNull()
    .references(() => alcoholCategories.id),
  styleId: integer("style_id")
    .notNull()
    .references(() => alcoholStyles.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => alcoholLocations.id),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  price: real("price").notNull(),
  proof: real("proof").notNull(),
  rating: real("rating").notNull().default(0),
  wishCnt: integer("wish_cnt").notNull().default(0),
  viewCnt: integer("view_cnt").notNull().default(0),
  noteCnt: integer("note_cnt").notNull().default(0),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Alcohol = typeof alcohols.$inferSelect; // 조회용
export type NewAlcohol = typeof alcohols.$inferInsert; // 생성용
export type UpdateAlcohol = Partial<
  Omit<Alcohol, "id" | "createdAt" | "userId">
>; // 수정용
