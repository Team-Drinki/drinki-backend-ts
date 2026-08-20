import { eq, and, sql, desc, count } from 'drizzle-orm'
import { db } from '../../plugins/database'
import { tastingNotes, users, reactions, comments, alcohols, alcoholCategories } from '../../db/schema'
import { TastingNoteModel } from './model'

export abstract class TastingNote {
  static async createNote(userId: number, body: TastingNoteModel.CreateTastingNoteRequestType) {
    const { title, content, alcoholId, customAlcohol, createdTime, aroma_note, palate_note, finish_note, images } = body

    if (!alcoholId && !customAlcohol?.name) {
      return { success: false, error: '술 정보가 필요합니다. alcoholId 또는 customAlcohol.name을 입력해주세요.', status: 400 }
    }

    const hasNote =
      Object.keys(aroma_note).length > 0 ||
      Object.keys(palate_note).length > 0 ||
      Object.keys(finish_note).length > 0
    if (!hasNote) {
      return { success: false, error: '아로마, 팔레트, 피니쉬 중 하나 이상의 노트를 입력해주세요.', status: 400 }
    }

    const createdAt = createdTime

    const [result] = await db
      .insert(tastingNotes)
      .values({
        title,
        content,
        userId: userId,
        alcoholId: alcoholId ?? null,
        customAlcoholName: alcoholId ? null : (customAlcohol?.name ?? null),
        customAlcoholCategory: alcoholId ? null : (customAlcohol?.category ?? null),
        aromaNote: aroma_note,
        palateNote: palate_note,
        finishNote: finish_note,
        images: images,
        createdAt,
        updatedAt: new Date()
      })
      .returning({ id: tastingNotes.id })

    return { success: true, id: result!.id }
  }

  static async getNotes(params: TastingNoteModel.SearchParamsType) {
    const { page = 1, size = 10, sort = 'createdAt', query, category } = params
    const offset = (page - 1) * size

    const conditions = []

    if (query) {
      conditions.push(sql`(${tastingNotes.title} LIKE ${`%${query}%`} OR ${alcohols.name} LIKE ${`%${query}%`} OR ${tastingNotes.customAlcoholName} LIKE ${`%${query}%`})`)
    }

    if (category) {
      conditions.push(sql`(${alcoholCategories.name} = ${category} OR ${tastingNotes.customAlcoholCategory} = ${category})`)
    }

    const baseQuery = db
      .select({
        noteId: tastingNotes.id,
        noteTitle: tastingNotes.title,
        alcoholCategory: sql<string>`COALESCE(${alcoholCategories.name}, ${tastingNotes.customAlcoholCategory}, '')`,
        alcoholName: sql<string>`COALESCE(${alcohols.name}, ${tastingNotes.customAlcoholName}, '')`,
        images: tastingNotes.images,
        writer: users.nickname,
        writerImage: users.profileImageUrl,
        commentNum: sql<number>`(SELECT count(*) FROM ${comments} WHERE ${comments.targetType} = 'tasting_note' AND ${comments.targetId} = ${tastingNotes.id})::int`,
        like: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'like')::int`,
        unlike: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'unlike')::int`,
        viewer: sql<number>`0`, // TODO : 구현
        createdTime: tastingNotes.createdAt,
      })
      .from(tastingNotes)
      .leftJoin(alcohols, eq(tastingNotes.alcoholId, alcohols.id))
      .leftJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .innerJoin(users, eq(tastingNotes.userId, users.id))
      .where(and(...conditions))
      .limit(size)
      .offset(offset)

    if (sort === 'createdAt') {
      baseQuery.orderBy(desc(tastingNotes.createdAt))
    } else {
      baseQuery.orderBy(desc(tastingNotes.createdAt))
    }

    const notes = await baseQuery

    const [totalCountQuery] = await db
      .select({ count: count() })
      .from(tastingNotes)
      .leftJoin(alcohols, eq(tastingNotes.alcoholId, alcohols.id))
      .leftJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .where(and(...conditions))

    const totalCount = totalCountQuery?.count || 0
    const totalPages = Math.ceil(totalCount / size)

    return {
      notes: notes.map((note: typeof notes[number]) => {
        const imageList = (note.images as string[]) || []
        return {
          ...note,
          noteImage: (imageList[0] ?? '') as string
        }
      }),
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

  static async getHotNotes() {
    const notes = await db
      .select({
        noteId: tastingNotes.id,
        noteTitle: tastingNotes.title,
        alcoholCategory: sql<string>`COALESCE(${alcoholCategories.name}, ${tastingNotes.customAlcoholCategory}, '')`,
        alcoholName: sql<string>`COALESCE(${alcohols.name}, ${tastingNotes.customAlcoholName}, '')`,
        images: tastingNotes.images,
        writer: users.nickname,
        writerImage: users.profileImageUrl,
        commentNum: sql<number>`(SELECT count(*) FROM ${comments} WHERE ${comments.targetType} = 'tasting_note' AND ${comments.targetId} = ${tastingNotes.id})::int`,
        like: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'like')::int`,
        unlike: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'unlike')::int`,
        viewer: sql<number>`0`,
        createdTime: tastingNotes.createdAt,
      })
      .from(tastingNotes)
      .leftJoin(alcohols, eq(tastingNotes.alcoholId, alcohols.id))
      .leftJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .innerJoin(users, eq(tastingNotes.userId, users.id))
      .orderBy(desc(sql`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'like')`), desc(tastingNotes.createdAt))
      .limit(5)

    return {
      notes: notes.map((note: typeof notes[number]) => {
        const imageList = (note.images as string[]) || []
        return {
          ...note,
          noteImage: (imageList[0] ?? '') as string
        }
      })
    }
  }

  static async getBestNotes(alcoholId: number) {
    const notes = await db
      .select({
        noteId: tastingNotes.id,
        noteTitle: tastingNotes.title,
        alcoholCategory: sql<string>`COALESCE(${alcoholCategories.name}, ${tastingNotes.customAlcoholCategory}, '')`,
        alcoholName: sql<string>`COALESCE(${alcohols.name}, ${tastingNotes.customAlcoholName}, '')`,
        images: tastingNotes.images,
        writer: users.nickname,
        writerImage: users.profileImageUrl,
        commentNum: sql<number>`(SELECT count(*) FROM ${comments} WHERE ${comments.targetType} = 'tasting_note' AND ${comments.targetId} = ${tastingNotes.id})::int`,
        like: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'like')::int`,
        unlike: sql<number>`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'unlike')::int`,
        viewer: sql<number>`0`,
        createdTime: tastingNotes.createdAt,
      })
      .from(tastingNotes)
      .leftJoin(alcohols, eq(tastingNotes.alcoholId, alcohols.id))
      .leftJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .innerJoin(users, eq(tastingNotes.userId, users.id))
      .where(eq(tastingNotes.alcoholId, alcoholId))
      .orderBy(desc(sql`(SELECT count(*) FROM ${reactions} WHERE ${reactions.targetType} = 'tasting_note' AND ${reactions.targetId} = ${tastingNotes.id} AND ${reactions.reactionType} = 'like')`), desc(tastingNotes.createdAt))
      .limit(3)

    return {
      notes: notes.map((note: typeof notes[number]) => {
        const imageList = (note.images as string[]) || []
        return {
          ...note,
          noteImage: (imageList[0] ?? '') as string
        }
      })
    }
  }

  static async updateNote(id: number, userId: number, body: TastingNoteModel.UpdateTastingNoteRequestType) {
    const { title, content, aroma_note, palate_note, finish_note, images } = body

    const [note] = await db.select().from(tastingNotes).where(eq(tastingNotes.id, id)).limit(1)

    if (!note) {
      return { success: false, error: '존재하지 않는 테이스팅 노트입니다.', status: 404 }
    }

    if (note.userId !== userId) {
      return { success: false, error: '수정 권한이 없습니다.', status: 403 }
    }

    await db
      .update(tastingNotes)
      .set({
        title,
        content,
        aromaNote: aroma_note,
        palateNote: palate_note,
        finishNote: finish_note,
        images: images,
        updatedAt: new Date()
      })
      .where(eq(tastingNotes.id, id))

    return { success: true, id }
  }

  static async deleteNote(id: number, userId: number) {
    const [note] = await db.select().from(tastingNotes).where(eq(tastingNotes.id, id)).limit(1)

    if (!note) {
      return { success: false, error: '존재하지 않는 테이스팅 노트입니다.', status: 404 }
    }

    if (note.userId !== userId) {
      return { success: false, error: '삭제 권한이 없습니다.', status: 403 }
    }

    await db.delete(tastingNotes).where(eq(tastingNotes.id, id))

    return { success: true, id }
  }

  static async createComment(noteId: number, userId: number, body: TastingNoteModel.CreateCommentRequestType) {
    const { content, parentId, createdTime } = body

    const [note] = await db.select().from(tastingNotes).where(eq(tastingNotes.id, noteId)).limit(1)

    if (!note) {
      return { success: false, error: '존재하지 않는 테이스팅 노트입니다.', status: 404 }
    }

    const createdAt = createdTime

    const [result] = await db
      .insert(comments)
      .values({
        userId,
        targetType: 'tasting_note',
        targetId: noteId,
        parentId: parentId,
        body: content,
        createdAt,
        updatedAt: new Date()
      })
      .returning({ id: comments.id })

    return { success: true, id: result!.id }
  }

  static async updateComment(noteId: number, commentId: number, userId: number, body: TastingNoteModel.UpdateCommentRequestType) {
    const { content } = body

    const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)

    if (!comment) {
      return { success: false, error: '존재하지 않는 댓글입니다.', status: 404 }
    }

    if (comment.targetId !== noteId || comment.targetType !== 'tasting_note') {
      return { success: false, error: '잘못된 요청입니다.', status: 400 }
    }

    if (comment.userId !== userId) {
      return { success: false, error: '수정 권한이 없습니다.', status: 403 }
    }

    await db
      .update(comments)
      .set({
        body: content,
        updatedAt: new Date()
      })
      .where(eq(comments.id, commentId))

    return { success: true, id: commentId }
  }

  static async deleteComment(noteId: number, commentId: number, userId: number) {
    const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)

    if (!comment) {
      return { success: false, error: '존재하지 않는 댓글입니다.', status: 404 }
    }

    if (comment.targetId !== noteId || comment.targetType !== 'tasting_note') {
      return { success: false, error: '잘못된 요청입니다.', status: 400 }
    }

    if (comment.deletedAt) {
      return { success: false, error: '이미 삭제된 댓글입니다.', status: 400 }
    }

    if (comment.userId !== userId) {
      return { success: false, error: '삭제 권한이 없습니다.', status: 403 }
    }

    await db
      .update(comments)
      .set({
        deletedAt: new Date()
      })
      .where(eq(comments.id, commentId))

    return { success: true, id: commentId }
  }

  static async toggleNoteLike(noteId: number, userId: number) {
    const [note] = await db.select().from(tastingNotes).where(eq(tastingNotes.id, noteId)).limit(1)

    if (!note) {
      return { success: false, error: '존재하지 않는 테이스팅 노트입니다.', status: 404 }
    }

    const [existing] = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.targetId, noteId),
          eq(reactions.targetType, 'tasting_note'),
          eq(reactions.reactionType, 'like')
        )
      )
      .limit(1)

    if (existing) {
      await db.delete(reactions).where(eq(reactions.id, existing.id))
    } else {
      await db
        .insert(reactions)
        .values({
          userId,
          targetId: noteId,
          targetType: 'tasting_note',
          reactionType: 'like'
        })
        .onConflictDoNothing()
    }

    const [likeCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .where(
        and(
          eq(reactions.targetId, noteId),
          eq(reactions.targetType, 'tasting_note'),
          eq(reactions.reactionType, 'like')
        )
      )

    return {
      success: true,
      liked: !existing,
      likeCount: likeCountRow?.count || 0
    }
  }

  static async toggleCommentLike(noteId: number, commentId: number, userId: number) {
    const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)

    if (!comment) {
      return { success: false, error: '존재하지 않는 댓글입니다.', status: 404 }
    }

    if (comment.targetId !== noteId || comment.targetType !== 'tasting_note') {
      return { success: false, error: '잘못된 요청입니다.', status: 400 }
    }

    if (comment.deletedAt) {
      return { success: false, error: '삭제된 댓글입니다.', status: 400 }
    }

    const [existing] = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.targetId, commentId),
          eq(reactions.targetType, 'comment'),
          eq(reactions.reactionType, 'like')
        )
      )
      .limit(1)

    if (existing) {
      await db.delete(reactions).where(eq(reactions.id, existing.id))
    } else {
      await db
        .insert(reactions)
        .values({
          userId,
          targetId: commentId,
          targetType: 'comment',
          reactionType: 'like'
        })
        .onConflictDoNothing()
    }

    const [likeCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .where(
        and(
          eq(reactions.targetId, commentId),
          eq(reactions.targetType, 'comment'),
          eq(reactions.reactionType, 'like')
        )
      )

    return {
      success: true,
      liked: !existing,
      likeCount: likeCountRow?.count || 0
    }
  }

  static async getNoteById(id: number) {
    const [note] = await db
      .select({
        noteId: tastingNotes.id,
        alcoholId: tastingNotes.alcoholId,
        title: tastingNotes.title,
        content: tastingNotes.content,
        writerId: tastingNotes.userId,
        writerName: users.nickname,
        writerImage: users.profileImageUrl,
        alcoholName: sql<string>`COALESCE(${alcohols.name}, ${tastingNotes.customAlcoholName}, '')`,
        alcoholCategory: sql<string>`COALESCE(${alcoholCategories.name}, ${tastingNotes.customAlcoholCategory}, '')`,
        createdTime: tastingNotes.createdAt,
        aromaNote: tastingNotes.aromaNote,
        palateNote: tastingNotes.palateNote,
        finishNote: tastingNotes.finishNote,
        images: tastingNotes.images,
        viewCount: tastingNotes.viewCount,
      })
      .from(tastingNotes)
      .innerJoin(users, eq(tastingNotes.userId, users.id))
      .leftJoin(alcohols, eq(tastingNotes.alcoholId, alcohols.id))
      .leftJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .where(eq(tastingNotes.id, id))
      .limit(1)

    if (!note) {
      return null
    }

    // like, unlike count
    const noteReactions = await db
      .select({
        type: reactions.reactionType,
        count: sql<number>`count(*)::int`
      })
      .from(reactions)
      .where(
        and(
          eq(reactions.targetId, id),
          eq(reactions.targetType, 'tasting_note')
        )
      )
      .groupBy(reactions.reactionType)

    const likeCount = noteReactions.find((r: typeof noteReactions[number]) => r.type === 'like')?.count || 0
    const unlikeCount = noteReactions.find((r: typeof noteReactions[number]) => r.type === 'unlike')?.count || 0

    const noteComments = await db
      .select({
        commentId: comments.id,
        parentId: comments.parentId,
        writerId: comments.userId,
        writerNickName: users.nickname,
        writerImage: users.profileImageUrl,
        content: comments.body,
        createdTime: comments.createdAt,
        deletedAt: comments.deletedAt
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.targetId, id),
          eq(comments.targetType, 'tasting_note')
        )
      )

    // TODO : n+1 문제 있는지 확인
    const commentsWithReactions = await Promise.all(noteComments.map(async (comment: typeof noteComments[number]) => {
      const commentReactions = await db
        .select({
          type: reactions.reactionType,
          count: sql<number>`count(*)::int`
        })
        .from(reactions)
        .where(
          and(
            eq(reactions.targetId, comment.commentId),
            eq(reactions.targetType, 'comment')
          )
        )
        .groupBy(reactions.reactionType)

      return {
        ...comment,
        content: comment.deletedAt ? '삭제된 댓글입니다.' : comment.content,
        like: commentReactions.find((r: typeof commentReactions[number]) => r.type === 'like')?.count || 0,
        unlike: commentReactions.find((r: typeof commentReactions[number]) => r.type === 'unlike')?.count || 0
      }
    }))

    return {
      noteId: note.noteId,
      alcoholId: note.alcoholId,
      title: note.title,
      content: note.content,
      writerId: note.writerId,
      writerName: note.writerName,
      writerImage: note.writerImage,
      alcoholName: note.alcoholName,
      alcoholCategory: note.alcoholCategory,
      like: likeCount,
      unlike: unlikeCount,
      viewer: note.viewCount,
      createdTime: note.createdTime,
      aroma_note: note.aromaNote as Record<string, Record<string, number>>,
      palate_note: note.palateNote as Record<string, Record<string, number>>,
      finish_note: note.finishNote as Record<string, Record<string, number>>,
      images: note.images as string[],
      comments: commentsWithReactions
    }
  }

  static async incrementViewCount(id: number) {
    await db
      .update(tastingNotes)
      .set({ viewCount: sql`${tastingNotes.viewCount} + 1` })
      .where(eq(tastingNotes.id, id))
  }
}
