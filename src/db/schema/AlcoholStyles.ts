import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

import { alcoholCategories } from './AlcoholCategories.ts'

export const alcoholStyles = sqliteTable('alcohol_styles', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => alcoholCategories.id),
  name:       text('name', { length: 255 }).notNull()
})

export type AlcoholStyle = typeof alcoholStyles.$inferSelect     // 조회용
export type NewAlcoholStyle = typeof alcoholStyles.$inferInsert  // 생성용
export type UpdateAlcoholStyle = Partial<Omit<AlcoholStyle, 'id'>>   // 수정용