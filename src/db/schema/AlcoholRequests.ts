import { pgTable, text, integer, real, timestamp, serial } from "drizzle-orm/pg-core";

import { users } from "./Users";
import { alcoholStyles } from "./AlcoholStyles";
import { alcoholLocations } from "./AlcoholLocations";
import { alcoholCategories } from "./AlcoholCategories";

export const alcoholRequests = pgTable("alcohol_requests", {
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
  proof: real("proof").notNull(),
  status: text("status", { enum: ["approve", "pending", "reject"] as const })
    .notNull()
    .default("pending"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AlcoholRequest = typeof alcoholRequests.$inferSelect; // 조회용
export type NewAlcoholRequest = typeof alcoholRequests.$inferInsert; // 생성용
export type UpdateAlcoholRequest = Partial<
  Omit<AlcoholRequest, "id" | "userId" | "createdAt">
>; // 수정용
