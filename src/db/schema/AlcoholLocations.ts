import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

export const alcoholLocations = sqliteTable('alcohol_locations', {
  id:   integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 255 }).notNull()
})

export type AlcoholLocation = typeof alcoholLocations.$inferSelect         // 조회용
export type NewAlcoholLocation = typeof alcoholLocations.$inferInsert      // 생성용
export type UpdateAlcoholLocation = Partial<Omit<AlcoholLocation, 'id'>>   // 수정용