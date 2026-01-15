import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'

export namespace TastingNoteModel {
    // TODO : json 형식으로 수정
    export const RatingMap = t.Record(t.String(), t.Record(t.String(), t.Number()))

    export const Comment = t.Object({
        commentId: t.Number(),
        parentId: t.Nullable(t.Number()),
        writerNickName: t.String(),
        writerImage: t.Nullable(t.String()),
        content: t.String(),
        like: t.Number(),
        unlike: t.Number(),
        createdTime: t.Date()
    })

    export const TastingNoteResponse = t.Object({
        noteId: t.Number(),
        title: t.String(),
        writerId: t.Number(),
        writerName: t.String(),
        writerImage: t.Nullable(t.String()),
        like: t.Number(),
        unlike: t.Number(),
        viewer: t.Number(),
        createdTime: t.Date(),
        aroma_note: RatingMap,
        palate_note: RatingMap,
        finish_note: RatingMap,
        images: t.Array(t.String()),
        comments: t.Array(Comment)
    })

    export type CommentType = Static<typeof Comment>
    export type TastingNoteResponseType = Static<typeof TastingNoteResponse>
}