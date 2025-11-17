import { sqliteTable, integer } from 'drizzle-orm/sqlite-core'
import { sql }                  from 'drizzle-orm'

import { users }    from './Users.ts'
import { alcohols } from './Alcohols.ts'

export const wishes = sqliteTable('wishes', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  userId:    integer('user_id').notNull().references(() => users.id),
  alcoholId: integer('alcohol_id').notNull().references(() => alcohols.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type Wish    = typeof wishes.$inferSelect  // 조회용
export type NewWish = typeof wishes.$inferInsert  // 생성용
