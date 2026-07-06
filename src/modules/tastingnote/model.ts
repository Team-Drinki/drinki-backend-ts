import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'

export namespace TastingNoteModel {
    // TODO : json 형식으로 수정
    export const RatingMap = t.Record(t.String(), t.Record(t.String(), t.Number()))

    export const Comment = t.Object({
        commentId: t.Number(),
        parentId: t.Nullable(t.Number()),
        writerId: t.Number(),
        writerNickName: t.String(),
        writerImage: t.Nullable(t.String()),
        content: t.String(),
        like: t.Number(),
        unlike: t.Number(),
        createdTime: t.Date()
    })

    export const TastingNoteResponse = t.Object({
        noteId: t.Number(),
        alcoholId: t.Nullable(t.Number()),
        title: t.String(),
        content: t.Nullable(t.String()),
        writerId: t.Number(),
        writerName: t.String(),
        writerImage: t.Nullable(t.String()),
        alcoholName: t.String(),
        alcoholCategory: t.String(),
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

    // TODO : type 꼭 써야 하는지 확인
    export type CommentType = Static<typeof Comment>
    export type TastingNoteResponseType = Static<typeof TastingNoteResponse>

    export const PageUtil = t.Object({
        currentPage: t.Number(),
        totalPages: t.Number(),
        totalCount: t.Number(),
        pageSize: t.Number(),
        hasNext: t.Boolean(),
        hasPrevious: t.Boolean()
    })

    export const SearchParams = t.Object({
        query: t.Optional(t.String()),
        category: t.Optional(t.String()),
        page: t.Optional(t.Numeric({ default: 1 })),
        size: t.Optional(t.Numeric({ default: 10 })),
        sort: t.Optional(t.String({ default: 'createdAt' }))
    })

    export const TastingNoteList = t.Object({
        noteId: t.Number(),
        noteTitle: t.String(),
        alcoholCategory: t.String(),
        alcoholName: t.String(),  // COALESCE fallback ensures non-null
        noteImage: t.String(),
        writer: t.String(),
        commentNum: t.Number(),
        like: t.Number(),
        unlike: t.Number(),
        viewer: t.Number(),
        createdTime: t.Date()
    })

    export const TastingNoteListResponse = t.Object({
        notes: t.Array(TastingNoteList),
        pageUtil: PageUtil
    })

    export type SearchParamsType = Static<typeof SearchParams>
    export type TastingNoteListResponseType = Static<typeof TastingNoteListResponse>

    export const CreateTastingNoteRequest = t.Object({
        title: t.String(),
        alcoholId: t.Optional(t.Numeric()),
        customAlcohol: t.Optional(t.Object({
            name: t.String({ minLength: 1 }),
            category: t.String({ minLength: 1 })
        })),
        content: t.Nullable(t.String()),
        createdTime: t.Date(),
        aroma_note: RatingMap,
        palate_note: RatingMap,
        finish_note: RatingMap,
        images: t.Array(t.String())
    })

    export const UpdateTastingNoteRequest = t.Object({
        title: t.String(),
        content: t.Nullable(t.String()),
        aroma_note: RatingMap,
        palate_note: RatingMap,
        finish_note: RatingMap,
        images: t.Array(t.String())
    })

    export const CreateCommentRequest = t.Object({
        parentId: t.Nullable(t.Number()),
        content: t.String(),
        createdTime: t.Date()
    })

    export const UpdateCommentRequest = t.Object({
        content: t.String()
    })

    export const HotTastingNoteListResponse = t.Object({
        notes: t.Array(TastingNoteList)
    })

    export const BestTastingNoteListResponse = t.Object({
        notes: t.Array(TastingNoteList)
    })

    export const LikeToggleResponse = t.Object({
        liked: t.Boolean(),
        likeCount: t.Number()
    })

    export type CreateTastingNoteRequestType = Static<typeof CreateTastingNoteRequest>
    export type UpdateTastingNoteRequestType = Static<typeof UpdateTastingNoteRequest>
    export type CreateCommentRequestType = Static<typeof CreateCommentRequest>
    export type UpdateCommentRequestType = Static<typeof UpdateCommentRequest>
    export type HotTastingNoteListResponseType = Static<typeof HotTastingNoteListResponse>
    export type BestTastingNoteListResponseType = Static<typeof BestTastingNoteListResponse>
    export type LikeToggleResponseType = Static<typeof LikeToggleResponse>
}