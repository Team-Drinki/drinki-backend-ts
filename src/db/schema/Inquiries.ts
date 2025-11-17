import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

import { users } from './Users.ts'

export const inquiries = sqliteTable('inquiries', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  userId:    integer('user_id').notNull().references(() => users.id),
  isSecret:  integer('is_secret', { mode: 'boolean' }).notNull().default(false),
  title:     text('title', { length: 100 }).notNull(),
  content:   text('content').notNull(),
  answer:    text('answer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type Inquiry = typeof inquiries.$inferSelect     // 조회용
export type NewInquiry = typeof inquiries.$inferInsert  // 생성용
export type UpdateInquiry = Partial<Omit<Inquiry, 'id' | 'userId' | 'createdAt' >>   // 수정용