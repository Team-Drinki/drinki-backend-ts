import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'

export namespace UserModel {
  // ===== 기본 스키마 =====
  
  export const user = t.Object({
    id: t.Number(),
    socialType: t.String(),
    socialId: t.String(),
    nickname: t.String(),
    profileImageUrl: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date()
  })

  // ===== 프로필 관련 =====
  
  // 내 프로필 응답
  export const userProfile = t.Object({
    id: t.Number(),
    socialType: t.String(),
    nickname: t.String(),
    profileImageUrl: t.String(),
    wishCnt: t.Number(),
    noteCnt: t.Number(),
    createdAt: t.Date()
  })

  // 공개 프로필 응답
  export const publicProfile = t.Object({
    id: t.Number(),
    nickname: t.String(),
    profileImageUrl: t.String(),
    wishCnt: t.Number(),
    noteCnt: t.Number(),
    createdAt: t.Date()
  })

  // 프로필 업데이트 요청
  export const profileUpdateRequest = t.Object({
    nickname: t.Optional(t.String({ minLength: 2, maxLength: 20 })),
    profileImageUrl: t.Optional(t.String())
  })

  // ===== 페이지네이션 =====
  
  export const paginationParams = t.Object({
    page: t.Optional(t.Numeric({ minimum: 1, maximum: 1000, default: 1 })),
    size: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 }))
  })

  export const pageUtil = t.Object({
    page: t.Number(),
    size: t.Number(),
    total: t.Number(),
    totalPages: t.Number()
  })

  // ===== 위시리스트 관련 =====
  
  export const wishListRequest = t.Object({
    page: t.Optional(t.Numeric({ minimum: 1, maximum: 1000, default: 1 })),
    size: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
    sort: t.Optional(t.Union([
      t.Literal('CreatedAt'),
      t.Literal('View'),
      t.Literal('TastingNote'),
      t.Literal('Like'),
      t.Literal('Rating'),
      t.Literal('PriceDesc'),
      t.Literal('PriceAsc')
    ], { default: 'CreatedAt' }))
  })

  export const wishItem = t.Object({
    id: t.Number(),
    name: t.String(),
    image: t.String(),
    category: t.String(),
    wish: t.Number(),
    rating: t.Number(),
    viewCnt: t.Number(),
    noteCnt: t.Number(),
    isWish: t.Boolean()
  })

  export const wishListResponse = t.Object({
    items: t.Array(wishItem),
    pageUtil: pageUtil
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
  export type WishListRequest = Static<typeof wishListRequest>
  export type WishListResponse = Static<typeof wishListResponse>
  export type NoteListResponse = Static<typeof noteListResponse>
  export type PostListResponse = Static<typeof postListResponse>
}