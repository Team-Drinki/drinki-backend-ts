import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

import { users } from './Users.ts'

export const posts = sqliteTable('posts', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  userId:    integer('user_id').notNull().references(() => users.id),
  title:     text('title', { length: 255 }).notNull(),
  imageUrl:  text('image_url'),
  category:  text('category', { enum: ['FREE', 'QUESTION', 'FAQ', 'NOTICE'] }).notNull(),
  body:      text('body').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type Post = typeof posts.$inferSelect     // 조회용
export type NewPost = typeof posts.$inferInsert  // 생성용
export type UpdatePost = Partial<Omit<Post, 'id' | 'createdAt' | 'userId' >>   // 수정용