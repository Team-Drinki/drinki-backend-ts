import { eq, and, sql, like, desc, asc, count } from 'drizzle-orm'
import { db } from '../../plugins/database'
import { tastingNotes, users, reactions, comments, alcohols, alcoholCategories } from '../../db/schema'
import { TastingNoteModel } from './model'

export abstract class TastingNote {
  static async getNotes(params: TastingNoteModel.SearchParamsType) {
    const { page = 1, size = 10, sort = 'createdAt', query, category } = params
    const offset = (page - 1) * size

    const conditions = []

    if (query) {
      conditions.push(sql`(${tastingNotes.title} LIKE ${`%${query}%`} OR ${alcohols.name} LIKE ${`%${query}%`})`)
    }

    if (category) {
      conditions.push(eq(alcoholCategories.name, category))
    }

    const baseQuery = db
      .select({
        noteId: tastingNotes.id,
        noteTitle: tastingNotes.title,
        alcoholCategory: alcoholCategories.name,
        alcoholName: alcohols.name,
        noteImage: tastingNotes.imageUrl,
        writer: users.nickname,
        commentNum: sql<number>`(SELECT count(*) FROM ${comments} WHERE ${comments.targetType} = 'tasting_note' AND ${comments.targetId} = ${tastingNotes.id})`,
        like: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'like')`,
        unlike: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'unlike')`,
        viewer: sql<number>`0`, // Not implemented
        createdTime: tastingNotes.createdAt,
      })
      .from(tastingNotes)
      .innerJoin(alcohols, eq(tastingNotes.alcoholId, alcohols.id))
      .innerJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .innerJoin(users, eq(tastingNotes.userId, users.id))
      .where(and(...conditions))
      .limit(size)
      .offset(offset)

    if (sort === 'createdAt') {
      baseQuery.orderBy(desc(tastingNotes.createdAt))
    } else {
      baseQuery.orderBy(desc(tastingNotes.createdAt))
    }

    const notes = await baseQuery.all()

    const totalCountQuery = await db
      .select({ count: count() })
      .from(tastingNotes)
      .innerJoin(alcohols, eq(tastingNotes.alcoholId, alcohols.id))
      .innerJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .where(and(...conditions))
      .get()

    const totalCount = totalCountQuery?.count || 0
    const totalPages = Math.ceil(totalCount / size)

    return {
      notes: notes.map(note => ({
        ...note,
        noteImage: note.noteImage || ''
      })),
      pageUtil: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        pageSize: size,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    }
  }

  static async getNoteById(id: number) {
    const note = await db
      .select({
        noteId: tastingNotes.id,
        title: tastingNotes.title,
        writerId: tastingNotes.userId,
        writerName: users.nickname,
        writerImage: users.profileImageUrl,
        createdTime: tastingNotes.createdAt,
        aromaNote: tastingNotes.aromaNote,
        palateNote: tastingNotes.palateNote,
        finishNote: tastingNotes.finishNote,
        imageUrl: tastingNotes.imageUrl,
      })
      .from(tastingNotes)
      .innerJoin(users, eq(tastingNotes.userId, users.id))
      .where(eq(tastingNotes.id, id))
      .get()

    if (!note) {
      return null
    }

    // like, unlike count
    const noteReactions = await db
      .select({
        type: reactions.reactionType,
        count: sql<number>`count(*)`
      })
      .from(reactions)
      .where(
        and(
          eq(reactions.targetId, id),
          eq(reactions.targetType, 'tasting_note')
        )
      )
      .groupBy(reactions.reactionType)
      .all()

    const likeCount = noteReactions.find(r => r.type === 'like')?.count || 0
    const unlikeCount = noteReactions.find(r => r.type === 'unlike')?.count || 0

    const noteComments = await db
      .select({
        commentId: comments.id,
        parentId: comments.parentId,
        writerNickName: users.nickname,
        writerImage: users.profileImageUrl,
        content: comments.body,
        createdTime: comments.createdAt
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.targetId, id),
          eq(comments.targetType, 'tasting_note')
        )
      )
      .all()

    // TODO : n+1 문제 있는지 확인
    const commentsWithReactions = await Promise.all(noteComments.map(async (comment) => {
      const commentReactions = await db
        .select({
          type: reactions.reactionType,
          count: sql<number>`count(*)`
        })
        .from(reactions)
        .where(
          and(
            eq(reactions.targetId, comment.commentId),
            eq(reactions.targetType, 'comment')
          )
        )
        .groupBy(reactions.reactionType)
        .all()

      return {
        ...comment,
        like: commentReactions.find(r => r.type === 'like')?.count || 0,
        unlike: commentReactions.find(r => r.type === 'unlike')?.count || 0
      }
    }))

    return {
      noteId: note.noteId,
      title: note.title,
      writerId: note.writerId,
      writerName: note.writerName,
      writerImage: note.writerImage,
      like: likeCount,
      unlike: unlikeCount,
      viewer: 0, // TODO : viewer count 구현
      createdTime: note.createdTime,
      aroma_note: note.aromaNote as Record<string, Record<string, number>>,
      palate_note: note.palateNote as Record<string, Record<string, number>>,
      finish_note: note.finishNote as Record<string, Record<string, number>>,
      images: note.imageUrl ? [note.imageUrl] : [],
      comments: commentsWithReactions
    }
  }
}
