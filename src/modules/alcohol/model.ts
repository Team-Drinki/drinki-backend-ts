import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'

export namespace AlcoholModel {
  // 스키마 정의
  export const alcohol = t.Object({
    id: t.Number(),
    name: t.String(),
    imageUrl: t.String(),
    price: t.Number(),
    proof: t.Number(),
    rating: t.Number(),
    wishCnt: t.Number(),
    viewCnt: t.Number(),
    noteCnt: t.Number(),
    content: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date()
  })

  export const paginationParams = t.Object({
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    size: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 }))
  })

  export const alcoholSearchParams = t.Composite([
    paginationParams,
    t.Object({
      sort: t.Optional(t.String({ default: 'createdAt:desc' })),
      query: t.Optional(t.String()),
      categoryId: t.Optional(t.Numeric()),
      locationId: t.Optional(t.Numeric()),
      styleId: t.Optional(t.Numeric()),
      priceMin: t.Optional(t.Numeric({ minimum: 0 })),
      priceMax: t.Optional(t.Numeric({ minimum: 0 })),
      rating: t.Optional(t.Numeric({ minimum: 0, maximum: 5 }))
    })
  ])

  export const paginationResponse = t.Object({
    page: t.Number(),
    size: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  })
  
  export const alcoholSearchResponse = t.Object({
    data: t.Array(alcohol),
    pagination: paginationResponse,
    filters: t.Record(t.String(), t.Any()),
    sort: t.Object({
      field: t.String(),
      order: t.Union([t.Literal('asc'), t.Literal('desc')])
    })
  })

  // 타입 추출 - Static 사용
  export type Alcohol = Static<typeof alcohol>

  export type PaginationParams = Static<typeof paginationParams>
  export type AlcoholSearchParams = Static<typeof alcoholSearchParams>
  
  export type PaginationResponse = Static<typeof paginationResponse>
  export type AlcoholSearchResponse = Static<typeof alcoholSearchResponse>
}