// modules/post/service.ts
import { eq, desc, asc, and, sql } from 'drizzle-orm'
import { db } from '../../plugins/database'
import { posts, comments, reactions, users } from '../../db/schema'
import type { 
  PostListRequest, 
  PostItem, 
  PostListResponse, 
  CommentItem,
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  CommentUpdateRequest
} from './model'

export abstract class Post {
  // ===== 게시글 관련 =====
  
  static async getList(params: PostListRequest, userId?: number): Promise<PostListResponse> {
    const { category, page = 1, size = 10, sort = 'createdAt' } = params
    const offset = (page - 1) * size

    // 정렬 조건
    const orderBy = this.getSortColumn(sort)

    // WHERE 조건
    const conditions = []
    if (category) {
      conditions.push(eq(posts.category, category))
    }

    // 전체 개수
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    const total = Number(totalResult[0]?.count || 0)
    const totalPages = Math.ceil(total / size)

    // 게시글 조회 (집계 데이터 포함)
    const results = await db
      .select({
        post: posts,
        author: {
          id: users.id,
          nickname: users.nickname,
          profileImageUrl: users.profileImageUrl
        },
        viewCnt: sql<number>`COALESCE((SELECT COUNT(*) FROM views WHERE target_type = 'post' AND target_id = ${posts.id}), 0)`,
        likeCnt: sql<number>`COALESCE((SELECT COUNT(*) FROM reactions WHERE target_type = 'post' AND target_id = ${posts.id} AND reaction_type = 'like'), 0)`,
        commentCnt: sql<number>`COALESCE((SELECT COUNT(*) FROM comments WHERE target_type = 'post' AND target_id = ${posts.id}), 0)`,
        isLiked: userId 
          ? sql<boolean>`EXISTS(SELECT 1 FROM reactions WHERE target_type = 'post' AND target_id = ${posts.id} AND user_id = ${userId} AND reaction_type = 'like')`
          : sql<boolean>`0`
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(size)
      .offset(offset)

    const items = results.map(item => ({
      id: item.post.id,
      userId: item.post.userId,
      author: item.author,
      title: item.post.title,
      imageUrl: item.post.imageUrl || undefined,
      category: item.post.category,
      body: item.post.body,
      viewCnt: item.viewCnt,
      likeCnt: item.likeCnt,
      commentCnt: item.commentCnt,
      isLiked: Boolean(item.isLiked),
      createdAt: item.post.createdAt,
      updatedAt: item.post.updatedAt
    }))

    return {
      items,
      pageUtil: {
        page,
        size,
        total,
        totalPages
      }
    }
  }

  static async findById(postId: number, userId?: number): Promise<PostItem> {
    const result = await db
      .select({
        post: posts,
        author: {
          id: users.id,
          nickname: users.nickname,
          profileImageUrl: users.profileImageUrl
        },
        viewCnt: sql<number>`COALESCE((SELECT COUNT(*) FROM views WHERE target_type = 'post' AND target_id = ${posts.id}), 0)`,
        likeCnt: sql<number>`COALESCE((SELECT COUNT(*) FROM reactions WHERE target_type = 'post' AND target_id = ${posts.id} AND reaction_type = 'like'), 0)`,
        commentCnt: sql<number>`COALESCE((SELECT COUNT(*) FROM comments WHERE target_type = 'post' AND target_id = ${posts.id}), 0)`,
        isLiked: userId 
          ? sql<boolean>`EXISTS(SELECT 1 FROM reactions WHERE target_type = 'post' AND target_id = ${posts.id} AND user_id = ${userId} AND reaction_type = 'like')`
          : sql<boolean>`0`
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1)
      .get()

    if (!result) {
      throw new Error('Post not found')
    }

    return {
      id: result.post.id,
      userId: result.post.userId,
      author: result.author,
      title: result.post.title,
      imageUrl: result.post.imageUrl || undefined,
      category: result.post.category,
      body: result.post.body,
      viewCnt: result.viewCnt,
      likeCnt: result.likeCnt,
      commentCnt: result.commentCnt,
      isLiked: Boolean(result.isLiked),
      createdAt: result.post.createdAt,
      updatedAt: result.post.updatedAt
    }
  }

  static async create(userId: number, data: PostCreateRequest) {
    const result = await db
      .insert(posts)
      .values({
        userId,
        title: data.title,
        imageUrl: data.imageUrl,
        category: data.category,
        body: data.body
      })
      .returning()
      .get()

    return result
  }

  static async update(postId: number, userId: number, data: PostUpdateRequest) {
    // 권한 확인
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)
      .get()

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.userId !== userId) {
      throw new Error('Forbidden: Not the post owner')
    }

    const result = await db
      .update(posts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning()
      .get()

    return result
  }

  static async delete(postId: number, userId: number): Promise<void> {
    // 권한 확인
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)
      .get()

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.userId !== userId) {
      throw new Error('Forbidden: Not the post owner')
    }

    await db
      .delete(posts)
      .where(eq(posts.id, postId))
  }

  // ===== 댓글 관련 =====

  static async getComments(postId: number, userId?: number): Promise<CommentItem[]> {
    const allComments = await db
      .select({
        comment: comments,
        author: {
          id: users.id,
          nickname: users.nickname,
          profileImageUrl: users.profileImageUrl
        },
        likeCnt: sql<number>`COALESCE((SELECT COUNT(*) FROM reactions WHERE target_type = 'comment' AND target_id = ${comments.id} AND reaction_type = 'like'), 0)`,
        isLiked: userId 
          ? sql<boolean>`EXISTS(SELECT 1 FROM reactions WHERE target_type = 'comment' AND target_id = ${comments.id} AND user_id = ${userId} AND reaction_type = 'like')`
          : sql<boolean>`0`
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(
        eq(comments.targetType, 'post'),
        eq(comments.targetId, postId)
      ))
      .orderBy(asc(comments.createdAt))

    // 계층 구조로 변환
    const commentMap = new Map<number, CommentItem>()
    const rootComments: CommentItem[] = []

    allComments.forEach(item => {
      const commentItem: CommentItem = {
        id: item.comment.id,
        userId: item.comment.userId,
        author: item.author,
        body: item.comment.body,
        parentId: item.comment.parentId || undefined,
        likeCnt: item.likeCnt,
        isLiked: Boolean(item.isLiked),
        createdAt: item.comment.createdAt,
        updatedAt: item.comment.updatedAt,
        replies: []
      }

      commentMap.set(item.comment.id, commentItem)

      if (item.comment.parentId) {
        const parent = commentMap.get(item.comment.parentId)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(commentItem)
        }
      } else {
        rootComments.push(commentItem)
      }
    })

    return rootComments
  }

  static async createComment(postId: number, userId: number, data: CommentCreateRequest) {
    const result = await db
      .insert(comments)
      .values({
        userId,
        targetType: 'post',
        targetId: postId,
        body: data.body,
        parentId: data.parentId
      })
      .returning()
      .get()

    return result
  }

  static async updateComment(commentId: number, userId: number, data: CommentUpdateRequest) {
    // 권한 확인
    const comment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)
      .get()

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.userId !== userId) {
      throw new Error('Forbidden: Not the comment owner')
    }

    const result = await db
      .update(comments)
      .set({
        body: data.body,
        updatedAt: new Date()
      })
      .where(eq(comments.id, commentId))
      .returning()
      .get()

    return result
  }

  static async deleteComment(commentId: number, userId: number): Promise<void> {
    // 권한 확인
    const comment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)
      .get()

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.userId !== userId) {
      throw new Error('Forbidden: Not the comment owner')
    }

    await db
      .delete(comments)
      .where(eq(comments.id, commentId))
  }

  // ===== 좋아요 관련 =====

  static async toggleLike(userId: number, targetType: 'post' | 'comment', targetId: number) {
    // 기존 좋아요 확인
    const existing = await db
      .select()
      .from(reactions)
      .where(and(
        eq(reactions.userId, userId),
        eq(reactions.targetType, targetType),
        eq(reactions.targetId, targetId),
        eq(reactions.reactionType, 'like')
      ))
      .limit(1)
      .get()

    if (existing) {
      // 좋아요 취소
      await db
        .delete(reactions)
        .where(eq(reactions.id, existing.id))
      
      return { isLiked: false }
    } else {
      // 좋아요 추가
      await db
        .insert(reactions)
        .values({
          userId,
          targetType,
          targetId,
          reactionType: 'like'
        })
      
      return { isLiked: true }
    }
  }

  // ===== Private 헬퍼 =====

  private static getSortColumn(sort: string) {
    const sortMap: Record<string, any> = {
      'createdAt': desc(posts.createdAt),
      'viewCnt': desc(sql`view_cnt`),
      'likeCnt': desc(sql`like_cnt`),
      'commentCnt': desc(sql`comment_cnt`)
    }
    
    return sortMap[sort] || desc(posts.createdAt)
  }
}