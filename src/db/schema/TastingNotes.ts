import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

import { users } from './Users.ts'
import { alcohols } from './Alcohols.ts'

export const tastingNotes = sqliteTable('tasting_notes', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  alcoholId:  integer('alcohol_id').notNull().references(() => alcohols.id),
  userId:     integer('user_id')   .notNull().references(() => users.id),
  title:      text('title', { length: 255 }).notNull(),
  imageUrl:   text('image_url'),
  aromaNote:  text('aroma_note',    { mode: 'json' }).notNull(), // JSON stored as text
  palateNote: text('palate_note',   { mode: 'json' }).notNull(),
  finishNote: text('finish_note',   { mode: 'json' }).notNull(),
  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export type TastingNote = typeof tastingNotes.$inferSelect     // 조회용
export type NewTastingNote = typeof tastingNotes.$inferInsert  // 생성용
export type UpdateTastingNote = Partial<Omit<TastingNote, 'id' | 'createdAt' | 'userId' >>   // 수정용