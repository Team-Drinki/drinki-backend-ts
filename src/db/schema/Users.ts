import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  socialType: text("social_type").notNull(), // 'google', 'kakao', etc.
  socialId: text("social_id"),
  nickname: text("nickname").notNull(),
  profileImageUrl: text("profile_image_url"),
  role: text("role", { enum: ["USER", "ADMIN"] })
    .notNull()
    .default("USER"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect; // 조회용
export type NewUser = typeof users.$inferInsert; // 생성용
export type UpdateUser = Partial<Omit<User, "id" | "createdAt">>; // 수정용
