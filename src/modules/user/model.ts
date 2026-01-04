import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'

// ===== 기본 스키마 =====

export const user = t.Object({
  id: t.Number(),
  socialType: t.String(),
  socialId: t.String(),
  nickname: t.String(),
  profileImageUrl: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date()
})

// ===== 프로필 관련 =====

// 내 프로필 응답
export const userProfile = t.Object({
  id: t.Number(),
  socialType: t.String(),
  nickname: t.String(),
  profileImageUrl: t.Union([t.String(), t.Null()]),
  wishCnt: t.Number(),
  noteCnt: t.Number(),
  createdAt: t.Date()
})

// 공개 프로필 응답
export const publicProfile = t.Object({
  id: t.Number(),
  nickname: t.String(),
  profileImageUrl: t.Union([t.String(), t.Null()]),
  wishCnt: t.Number(),
  noteCnt: t.Number(),
  createdAt: t.Date()
})

// 프로필 업데이트 요청
export const profileUpdateRequest = t.Object({
  nickname: t.Optional(t.String({ minLength: 2, maxLength: 20 })),
  profileImageUrl: t.Optional(t.String())
})

// ===== 페이지네이션 & Params =====

export const paginationParams = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, maximum: 1000, default: 1 })),
  size: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 }))
})

export const userIdParam = t.Object({
  userId: t.Numeric({ minimum: 1 })
})

export const pageUtil = t.Object({
  page: t.Number(),
  size: t.Number(),
  total: t.Number(),
  totalPages: t.Number()
})

// ===== 노트 관련 =====

export const noteItem = t.Object({
  id: t.Number(),
  alcoholId: t.Number(),
  alcoholName: t.String(),
  alcoholImage: t.String(),
  content: t.String(),
  rating: t.Number(),
  createdAt: t.Date()
})

export const noteListResponse = t.Object({
  items: t.Array(noteItem),
  pageUtil: pageUtil
})

// ===== 게시물 관련 =====

export const postItem = t.Object({
  id: t.Number(),
  title: t.String(),
  content: t.String(),
  viewCnt: t.Number(),
  likeCnt: t.Number(),
  commentCnt: t.Number(),
  createdAt: t.Date()
})

export const postListResponse = t.Object({
  items: t.Array(postItem),
  pageUtil: pageUtil
})

// ===== 타입 추출 =====

export type User = Static<typeof user>
export type UserProfile = Static<typeof userProfile>
export type PublicProfile = Static<typeof publicProfile>
export type ProfileUpdateRequest = Static<typeof profileUpdateRequest>
export type NoteListResponse = Static<typeof noteListResponse>
export type PostListResponse = Static<typeof postListResponse>