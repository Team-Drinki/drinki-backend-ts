// modules/post/model.ts
import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'

// ===== 게시글 스키마 =====

export const postCreateRequest = t.Object({
  title: t.String({ minLength: 1, maxLength: 255 }),
  imageUrl: t.Optional(t.String()),
  category: t.Union([
    t.Literal('FREE'),
    t.Literal('QUESTION'),
    t.Literal('FAQ'),
    t.Literal('NOTICE')
  ]),
  body: t.String({ minLength: 1 })
})

export const postUpdateRequest = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  imageUrl: t.Optional(t.String()),
  category: t.Optional(t.Union([
    t.Literal('FREE'),
    t.Literal('QUESTION'),
    t.Literal('FAQ'),
    t.Literal('NOTICE')
  ])),
  body: t.Optional(t.String({ minLength: 1 }))
})

export const postListRequest = t.Object({
  category: t.Optional(t.Union([
    t.Literal('FREE'),
    t.Literal('QUESTION'),
    t.Literal('FAQ'),
    t.Literal('NOTICE')
  ])),
  page: t.Optional(t.Numeric({ minimum: 1, maximum: 1000, default: 1 })),
  size: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  sort: t.Optional(t.Union([
    t.Literal('createdAt'),
    t.Literal('viewCnt'),
    t.Literal('likeCnt'),
    t.Literal('commentCnt')
  ], { default: 'createdAt' }))
})

export const postItem = t.Object({
  id: t.Number(),
  userId: t.Number(),
  author: t.Object({
    id: t.Number(),
    nickname: t.String(),
    profileImageUrl: t.Union([t.String(), t.Null()]) // null 허용
  }),
  title: t.String(),
  imageUrl: t.Optional(t.String()),
  category: t.String(),
  body: t.String(),
  viewCnt: t.Number(),
  likeCnt: t.Number(),
  commentCnt: t.Number(),
  isLiked: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date()
})

export const postListResponse = t.Object({
  items: t.Array(postItem),
  pageUtil: t.Object({
    page: t.Number(),
    size: t.Number(),
    total: t.Number(),
    totalPages: t.Number()
  })
})

// ===== 댓글 스키마 =====

export const commentCreateRequest = t.Object({
  body: t.String({ minLength: 1 }),
  parentId: t.Optional(t.Number())
})

export const commentUpdateRequest = t.Object({
  body: t.String({ minLength: 1 })
})

export const commentItem = t.Object({
  id: t.Number(),
  userId: t.Number(),
  author: t.Object({
    id: t.Number(),
    nickname: t.String(),
    profileImageUrl: t.Union([t.String(), t.Null()]) // null 허용
  }),
  body: t.String(),
  parentId: t.Optional(t.Number()),
  likeCnt: t.Number(),
  isLiked: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  replies: t.Optional(t.Array(t.Any()))
})

// ===== 타입 추출 =====

export type PostCreateRequest = Static<typeof postCreateRequest>
export type PostUpdateRequest = Static<typeof postUpdateRequest>
export type PostListRequest = Static<typeof postListRequest>
export type PostItem = Static<typeof postItem>
export type PostListResponse = Static<typeof postListResponse>
export type CommentCreateRequest = Static<typeof commentCreateRequest>
export type CommentUpdateRequest = Static<typeof commentUpdateRequest>
export type CommentItem = Static<typeof commentItem>