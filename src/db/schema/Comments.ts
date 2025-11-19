import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

import { users } from './Users.ts'

export const comments = sqliteTable('comments', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  userId:     integer('user_id').notNull().references(() => users.id),
  targetType: text('target_type', { enum: ['post', 'tasting_note', 'alcohol'] }).notNull(),
  targetId:   integer('target_id').notNull(),
  parentId:   integer('parent_id').references((): any => comments.id),
  body:       text('body').notNull(),
  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type Comment = typeof comments.$inferSelect     // 조회용
export type NewComment = typeof comments.$inferInsert  // 생성용
export type UpdateComment = Partial<Omit<Comment, 'id' | 'userId' | 'targetType' | 'targetId' | 'parentId' | 'createdAt' >>   // 수정용