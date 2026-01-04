// modules/wish/index.ts
import { Elysia, t } from 'elysia'
import { Wish } from './service'
import {
  wishListRequest,
  wishListResponse
} from './model'

export const wish = new Elysia({
  prefix: '/wishes'
})
  // ===== 내 위시 관리 =====
  
  // 내 위시리스트 조회
  .get('/my', async ({ authUser, query }: any) => {
    return await Wish.getMyWishList(authUser.userId, query)
  }, {
    query: wishListRequest,
    response: {
      200: wishListResponse
    },
    detail: {
      summary: '내 위시리스트 조회 API',
      tags: ['Wish']
    }
  })

  // 특정 술 위시 여부 조회
  .get('/my/alcohol/:alcoholId', async ({ authUser, params }: any) => {
    const isWished = await Wish.isWished(authUser.userId, params.alcoholId)
    return { isWished }
  }, {
    params: t.Object({
      alcoholId: t.Numeric({ minimum: 1 })
    }),
    response: {
      200: t.Object({
        isWished: t.Boolean()
      })
    },
    detail: {
      summary: '특정 술 위시 여부 조회 API',
      tags: ['Wish']
    }
  })

  // 위시 추가
  .post('/my/alcohol/:alcoholId', async ({ authUser, params }: any) => {
    await Wish.addWish(authUser.userId, params.alcoholId)
    return { success: true }
  }, {
    params: t.Object({
      alcoholId: t.Numeric({ minimum: 1 })
    }),
    response: {
      200: t.Object({
        success: t.Boolean()
      })
    },
    detail: {
      summary: '위시 추가 API',
      tags: ['Wish']
    }
  })

  // 위시 삭제
  .delete('/my/alcohol/:alcoholId', async ({ authUser, params, set }: any) => {
    await Wish.removeWish(authUser.userId, params.alcoholId)
    set.status = 204
  }, {
    params: t.Object({
      alcoholId: t.Numeric({ minimum: 1 })
    }),
    detail: {
      summary: '위시 삭제 API',
      tags: ['Wish']
    }
  })

  // ===== 특정 사용자 위시 조회 (공개) =====
  
  // 특정 사용자 위시리스트 조회
  .get('/wishes/:userId', async ({ params, query }: any) => {
    return await Wish.getUserWishList(params.userId, query)
  }, {
    params: t.Object({
      userId: t.Numeric({ minimum: 1 })
    }),
    query: wishListRequest,
    response: {
      200: wishListResponse
    },
    detail: {
      summary: '특정 사용자 위시리스트 조회 API',
      tags: ['Wish']
    }
  })