import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

import { users } from './Users.ts'
import { alcoholCategories } from './AlcoholCategories.ts'
import { alcoholStyles } from './AlcoholStyles.ts'
import { alcoholLocations } from './AlcoholLocations.ts'

export const alcohols = sqliteTable('alcohols', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  userId:     integer('user_id').notNull().references(() => users.id),
  categoryId: integer('category_id').notNull().references(() => alcoholCategories.id),
  styleId:    integer('style_id').notNull().references(() => alcoholStyles.id),
  locationId: integer('location_id').notNull().references(() => alcoholLocations.id),
  name:       text('name', { length: 255 }).notNull(),
  imageUrl:   text('image_url').notNull(),
  price:      real('price').notNull(),
  proof:      real('proof').notNull(),
  rating:     real('rating').notNull().default(0),
  wishCnt:    integer('wish_cnt').notNull().default(0),
  viewCnt:    integer('view_cnt').notNull().default(0),
  noteCnt:    integer('note_cnt').notNull().default(0),
  content:    text('content').notNull(),
  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type Alcohol = typeof alcohols.$inferSelect     // 조회용
export type NewAlcohol = typeof alcohols.$inferInsert  // 생성용
export type UpdateAlcohol = Partial<Omit<Alcohol, 'id' | 'createdAt' | 'userId' >>   // 수정용