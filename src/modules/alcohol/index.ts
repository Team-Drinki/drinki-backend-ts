import { Elysia } from 'elysia'
import { t } from 'elysia'

import { Alcohol } from './service'
import { AlcoholModel } from './model'

export const alcohol = new Elysia({
  prefix: '/alcohols' 
})
  .get('/search', async ({ query }) => {
    // query는 자동으로 검증되고 타입이 지정됨
    const results = await Alcohol.search(query)
    return results
  }, {
    query: AlcoholModel.alcoholSearchParams,  // 입력 검증
    response: {
      200: AlcoholModel.alcoholSearchResponse,  // 응답 검증
      400: t.Object({ 
        error: t.String() 
      })
    },
    detail: {
      summary: 'Search alcohols',
      tags: ['Alcohol']
    }
  })

  .get('/recommend', async ({ query }) => {
    // alcoholService 대신 Alcohol 클래스 사용
    const { userId, limit = 10 } = query
    const recommendations = await Alcohol.getRecommendations(userId, limit)
    return recommendations
  }, {
    query: t.Object({
      userId: t.Optional(t.Numeric()),
      limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50, default: 10 }))
    }),
    detail: {
      summary: 'Get alcohol recommendations',
      tags: ['Alcohol']
    }
  })

  .get('/:alcoholId', async ({ params }) => {
    // alcoholService 대신 Alcohol 클래스 사용
    return await Alcohol.findById(params.alcoholId)
  }, {
    params: t.Object({
      alcoholId: t.Numeric({ minimum: 1 })
    }),
    detail: {
      summary: 'Get alcohol by ID',
      tags: ['Alcohol']
    }
  })



  .guard({
    // 인증이 필요한 엔드포인트들
    beforeHandle: async ({ headers, set }) => {
      // JWT 검증 로직
      const token = headers.authorization?.replace('Bearer ', '')
      if (!token) {
        set.status = 401
        return { error: 'Unauthorized' }
      }
      // TODO: JWT 검증 및 사용자 정보 추출
      return true  // 임시로 통과
    }
  }, app => app
    .post('/', async ({ body }) => {
      // TODO: Alcohol.create 메소드 구현 필요
      // return await Alcohol.create(body)
      return { message: 'Not implemented yet', data: body }
    }, {
      body: t.Object({
        categoryId: t.Number(),
        styleId: t.Number(),
        locationId: t.Number(),
        name: t.String({ minLength: 1, maxLength: 255 }),
        imageUrl: t.String(),
        price: t.Number({ minimum: 0 }),
        proof: t.Number({ minimum: 0, maximum: 100 }),
        content: t.String()
      }),
      detail: {
        summary: 'Create new alcohol',
        tags: ['Alcohol']
      }
    })

    .patch('/:alcoholId', async ({ params, body }) => {
      // TODO: Alcohol.update 메소드 구현 필요
      // return await Alcohol.update(params.alcoholId, body)
      return { message: 'Not implemented yet', id: params.alcoholId, data: body }
    }, {
      params: t.Object({
        alcoholId: t.Numeric({ minimum: 1 })
      }),
      body: t.Partial(t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        imageUrl: t.String(),
        price: t.Number({ minimum: 0 }),
        proof: t.Number({ minimum: 0, maximum: 100 }),
        content: t.String()
      })),
      detail: {
        summary: 'Update alcohol',
        tags: ['Alcohol']
      }
    })

    .delete('/:alcoholId', async ({ params }) => {
      // TODO: Alcohol.delete 메소드 구현 필요
      // return await Alcohol.delete(params.alcoholId)
      return { message: 'Not implemented yet', id: params.alcoholId }
    }, {
      params: t.Object({
        alcoholId: t.Numeric({ minimum: 1 })
      }),
      detail: {
        summary: 'Delete alcohol',
        tags: ['Alcohol']
      }
    })
  )