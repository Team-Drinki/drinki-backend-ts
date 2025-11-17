import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

import { flavorCategories } from './FlavorCategories.ts'

export const flavorKeywords = sqliteTable('flavor_keywords', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => flavorCategories.id),
  name:       text('name', { length: 255 }).notNull()
})

export type FlavorKeyword = typeof flavorKeywords.$inferSelect     // 조회용
export type NewFlavorKeyword = typeof flavorKeywords.$inferInsert  // 생성용
export type UpdateFlavorKeyword = Partial<Omit<FlavorKeyword, 'id'>>   // 수정용