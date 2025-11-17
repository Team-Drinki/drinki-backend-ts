import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql }                        from 'drizzle-orm'

export const users = sqliteTable('users', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  socialType:      text('social_type').notNull(), // 'google', 'kakao', etc.
  socialId:        text('social_id'),
  nickname:        text('nickname', { length: 20 }).notNull(),
  profileImageUrl: text('profile_image_url'),
  role:            text('role', { enum: ['USER', 'ADMIN'] }).notNull().default('USER'),
  isDeleted:       integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  createdAt:       integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt:       integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type User = typeof users.$inferSelect                      // 조회용
export type NewUser = typeof users.$inferInsert                   // 생성용
export type UpdateUser = Partial<Omit<User, 'id' | 'createdAt'>>  // 수정용
