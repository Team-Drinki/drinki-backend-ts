import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

import { users } from './Users.ts'
import { alcoholStyles } from './AlcoholStyles'
import { alcoholLocations } from './AlcoholLocations'
import { alcoholCategories } from './AlcoholCategories'

export const alcoholRequests = sqliteTable('alcohol_requests', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  userId:     integer('user_id').notNull().references(() => users.id),
  categoryId: integer('category_id').notNull().references(() => alcoholCategories.id),
  styleId:    integer('style_id').notNull().references(() => alcoholStyles.id),
  locationId: integer('location_id').notNull().references(() => alcoholLocations.id),
  name:       text('name', { length: 255 }).notNull(),
  imageUrl:   text('image_url').notNull(),
  proof:      real('proof').notNull(),
  status:     text('status', { enum: ['approve', 'pending', 'reject'] as const }).notNull().default('pending'),
  content:    text('content').notNull(),
  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type AlcoholRequest = typeof alcoholRequests.$inferSelect     // 조회용
export type NewAlcoholRequest = typeof alcoholRequests.$inferInsert  // 생성용
export type UpdateAlcoholRequest = Partial<Omit<AlcoholRequest, 'id' | 'userId' | 'createdAt' >>   // 수정용