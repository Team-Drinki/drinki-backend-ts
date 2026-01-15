import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../plugins/database'
import { tastingNotes, users, reactions, comments } from '../../db/schema'

export abstract class TastingNote {
  static async getNote(id: number) {
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
