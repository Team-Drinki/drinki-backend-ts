import { Elysia, t } from 'elysia'
import { UserService, WishService } from './service'
import { UserModel } from './model'

export const user = new Elysia({
  prefix: '/users'
})
  // ===== 내 정보 관리 =====
  
  // 내 정보 조회
  .get('/me', async ({ authUser }: any) => {
    return await UserService.getUserProfile(authUser.userId)
  }, {
    response: {
      200: UserModel.userProfile
    },
    detail: {
      summary: '내 정보 조회 API',
      tags: ['User']
    }
  })

  // 내 정보 수정
  .post('/me', async ({ authUser, body }: any) => {
    return await UserService.updateUserProfile(authUser.userId, body)
  }, {
    body: UserModel.profileUpdateRequest,
    response: {
      200: UserModel.userProfile
    },
    detail: {
      summary: '내 정보 수정 API',
      tags: ['User']
    }
  })

  // ===== 내 컬렉션 조회 =====
  
  // 내 위시 리스트 조회
  .get('/me/wishes', async ({ authUser, query }: any) => {
    return await UserService.getUserWishList(authUser.userId, query)
  }, {
    query: UserModel.wishListRequest,
    response: {
      200: UserModel.wishListResponse
    },
    detail: {
      summary: '내 위시 리스트 조회 API',
      tags: ['User', 'Wish']
    }
  })

  // 내 테이스팅 노트 리스트 조회
  .get('/me/notes', async ({ authUser, query }: any) => {
    return await UserService.getUserNotes(authUser.userId, query)
  }, {
    query: UserModel.paginationParams,
    response: {
      200: UserModel.noteListResponse
    },
    detail: {
      summary: '내 테이스팅 노트 리스트 조회 API',
      tags: ['User', 'Note']
    }
  })

  // 내 커뮤니티 글 리스트 조회
  .get('/me/posts', async ({ authUser, query }: any) => {
    return await UserService.getUserPosts(authUser.userId, query)
  }, {
    query: UserModel.paginationParams,
    response: {
      200: UserModel.postListResponse
    },
    detail: {
      summary: '내 커뮤니티 글 리스트 조회 API',
      tags: ['User', 'Post']
    }
  })

  // ===== 내 위시 관리 (특정 술) =====
  
  // 내 위시 여부 조회
  .get('/me/wishes/:alcoholId', async ({ authUser, params }: any) => {
    const isWished = await WishService.isWished(authUser.userId, params.alcoholId)
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
      summary: '내 위시 여부 조회 API',
      tags: ['Wish']
    }
  })

  // 위시리스트에 술 추가
  .post('/me/wishes/:alcoholId', async ({ authUser, params }: any) => {
    await WishService.addWish(authUser.userId, params.alcoholId)
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
      summary: '위시리스트에 술 추가 API',
      tags: ['Wish']
    }
  })

  // 위시리스트에서 술 삭제
  .delete('/me/wishes/:alcoholId', async ({ authUser, params, set }: any) => {
    await WishService.removeWish(authUser.userId, params.alcoholId)
    set.status = 204
  }, {
    params: t.Object({
      alcoholId: t.Numeric({ minimum: 1 })
    }),
    detail: {
      summary: '위시리스트에서 술 삭제 API',
      tags: ['Wish']
    }
  })

  // ===== 특정 사용자 정보 조회 =====
  
  // 특정 사용자 정보 조회
  .get('/:userId', async ({ params }) => {
    return await UserService.getPublicProfile(params.userId)
  }, {
    params: t.Object({
      userId: t.Numeric({ minimum: 1 })
    }),
    response: {
      200: UserModel.publicProfile
    },
    detail: {
      summary: '특정 사용자 정보 조회 API',
      tags: ['User']
    }
  })

  // 특정 사용자 위시 리스트 조회
  .get('/:userId/wishes', async ({ params, query }) => {
    return await UserService.getPublicWishList(params.userId, query)
  }, {
    params: t.Object({
      userId: t.Numeric({ minimum: 1 })
    }),
    query: UserModel.wishListRequest,
    response: {
      200: UserModel.wishListResponse
    },
    detail: {
      summary: '특정 사용자 위시 리스트 조회 API',
      tags: ['User', 'Wish']
    }
  })