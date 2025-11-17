import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

export const alcoholCategories = sqliteTable('alcohol_categories', {
  id:   integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 255 }).notNull()
})

export type AlcoholCategory = typeof alcoholCategories.$inferSelect        // 조회용
export type NewAlcoholCategory = typeof alcoholCategories.$inferInsert     // 생성용
export type UpdateAlcoholCategory = Partial<Omit<AlcoholCategory, 'id'>>   // 수정용