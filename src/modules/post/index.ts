// modules/post/index.ts
import { Elysia, t } from 'elysia'
import { Post } from './service'
import {
  postCreateRequest,
  postUpdateRequest,
  postListRequest,
  postListResponse,
  postItem,
  commentCreateRequest,
  commentUpdateRequest,
  commentItem
} from './model'

export const post = new Elysia({ prefix: '/posts' })
  // ===== 게시글 관리 =====
  
  // 게시글 리스트 조회
  .get('/', async ({ query, authUser }: any) => {
    return await Post.getList(query, authUser?.userId)
  }, {
    query: postListRequest,
    response: {
      200: postListResponse
    },
    detail: {
      summary: '게시글 리스트 조회 API',
      tags: ['Post']
    }
  })

  // 게시글 상세 조회
  .get('/:postId', async ({ params, authUser }: any) => {
    return await Post.findById(params.postId, authUser?.userId)
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 })
    }),
    response: {
      200: postItem
    },
    detail: {
      summary: '게시글 상세 조회 API',
      tags: ['Post']
    }
  })

  // 게시글 작성
  .post('/', async ({ body, authUser }: any) => {
    return await Post.create(authUser.userId, body)
  }, {
    body: postCreateRequest,
    detail: {
      summary: '게시글 작성 API',
      tags: ['Post']
    }
  })

  // 게시글 수정
  .put('/:postId', async ({ params, body, authUser }: any) => {
    return await Post.update(params.postId, authUser.userId, body)
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 })
    }),
    body: postUpdateRequest,
    detail: {
      summary: '게시글 수정 API',
      tags: ['Post']
    }
  })

  // 게시글 삭제
  .delete('/:postId', async ({ params, authUser, set }: any) => {
    await Post.delete(params.postId, authUser.userId)
    set.status = 204
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 })
    }),
    detail: {
      summary: '게시글 삭제 API',
      tags: ['Post']
    }
  })

  // ===== 댓글 관리 =====
  
  // 댓글 목록 조회
  .get('/:postId/comments', async ({ params, authUser }: any) => {
    return await Post.getComments(params.postId, authUser?.userId)
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 })
    }),
    response: {
      200: t.Array(commentItem)
    },
    detail: {
      summary: '댓글 목록 조회 API',
      tags: ['Comment']
    }
  })

  // 댓글 작성
  .post('/:postId/comments', async ({ params, body, authUser }: any) => {
    return await Post.createComment(params.postId, authUser.userId, body)
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 })
    }),
    body: commentCreateRequest,
    detail: {
      summary: '댓글 작성 API',
      tags: ['Comment']
    }
  })

  // 댓글 수정
  .put('/:postId/comments/:commentId', async ({ params, body, authUser }: any) => {
    return await Post.updateComment(params.commentId, authUser.userId, body)
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 }),
      commentId: t.Numeric({ minimum: 1 })
    }),
    body: commentUpdateRequest,
    detail: {
      summary: '댓글 수정 API',
      tags: ['Comment']
    }
  })

  // 댓글 삭제
  .delete('/:postId/comments/:commentId', async ({ params, authUser, set }: any) => {
    await Post.deleteComment(params.commentId, authUser.userId)
    set.status = 204
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 }),
      commentId: t.Numeric({ minimum: 1 })
    }),
    detail: {
      summary: '댓글 삭제 API',
      tags: ['Comment']
    }
  })

  // ===== 좋아요 관리 =====
  
  // 게시글 좋아요 토글
  .post('/:postId/like', async ({ params, authUser }: any) => {
    return await Post.toggleLike(authUser.userId, 'post', params.postId)
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 })
    }),
    response: {
      200: t.Object({
        isLiked: t.Boolean()
      })
    },
    detail: {
      summary: '게시글 좋아요 토글 API',
      tags: ['Reaction']
    }
  })

  // 댓글 좋아요 토글
  .post('/:postId/comments/:commentId/like', async ({ params, authUser }: any) => {
    return await Post.toggleLike(authUser.userId, 'comment', params.commentId)
  }, {
    params: t.Object({
      postId: t.Numeric({ minimum: 1 }),
      commentId: t.Numeric({ minimum: 1 })
    }),
    response: {
      200: t.Object({
        isLiked: t.Boolean()
      })
    },
    detail: {
      summary: '댓글 좋아요 토글 API',
      tags: ['Reaction']
    }
  })