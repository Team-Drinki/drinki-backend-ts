import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

export const flavorCategories = sqliteTable('flavor_categories', {
  id:   integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 255 }).notNull()
})

export type FlavorCategory = typeof flavorCategories.$inferSelect     // 조회용
export type NewFlavorCategory = typeof flavorCategories.$inferInsert  // 생성용
export type UpdateFlavorCategory = Partial<Omit<FlavorCategory, 'id'>>   // 수정용