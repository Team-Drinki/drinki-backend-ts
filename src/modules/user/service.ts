import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../plugins/database'
import { users, wishes, alcohols } from '../../db/schema'
import { UserModel } from './model'

export abstract class UserService {
  // ===== 프로필 관련 =====
  
  // 내 프로필 조회
  static async getUserProfile(userId: number): Promise<UserModel.UserProfile> {
    const user = await db
      .select({
        id: users.id,
        socialType: users.socialType,
        socialId: users.socialId,
        nickname: users.nickname,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .get()

    if (!user) {
      throw new Error('User not found')
    }

    const [wishCount, noteCount] = await Promise.all([
      this.getWishCount(userId),
      this.getNoteCount(userId)
    ])

    return {
      id: user.id,
      socialType: user.socialType,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      wishCnt: wishCount,
      noteCnt: noteCount,
      createdAt: user.createdAt
    }
  }

  // 공개 프로필 조회
  static async getPublicProfile(userId: number): Promise<UserModel.PublicProfile> {
    const user = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .get()

    if (!user) {
      throw new Error('User not found')
    }

    const [wishCount, noteCount] = await Promise.all([
      this.getWishCount(userId),
      this.getNoteCount(userId)
    ])

    return {
      id: user.id,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      wishCnt: wishCount,
      noteCnt: noteCount,
      createdAt: user.createdAt
    }
  }

  // 프로필 업데이트
  static async updateUserProfile(
    userId: number, 
    request: UserModel.ProfileUpdateRequest
  ): Promise<UserModel.UserProfile> {
    const updateData: any = {}
    
    if (request.nickname !== undefined) {
      updateData.nickname = request.nickname
    }
    if (request.profileImageUrl !== undefined) {
      updateData.profileImageUrl = request.profileImageUrl
    }
    
    updateData.updatedAt = new Date()

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))

    return this.getUserProfile(userId)
  }

  // ===== 위시리스트 관련 =====
  
  // 내 위시리스트 조회
  static async getUserWishList(
    userId: number, 
    request: UserModel.WishListRequest
  ): Promise<UserModel.WishListResponse> {
    return this.getWishList(userId, request)
  }

  // 공개 위시리스트 조회
  static async getPublicWishList(
    userId: number,
    request: UserModel.WishListRequest
  ): Promise<UserModel.WishListResponse> {
    // TODO: 공개 여부 체크
    return this.getWishList(userId, request)
  }

  // 위시리스트 조회 공통 로직
  private static async getWishList(
    userId: number,
    request: UserModel.WishListRequest
  ): Promise<UserModel.WishListResponse> {
    const { page = 1, size = 10, sort = 'CreatedAt' } = request
    const offset = (page - 1) * size

    const sortColumn = this.getSortColumn(sort)

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishes)
      .where(eq(wishes.userId, userId))
    
    const total = Number(totalResult[0]?.count || 0)
    const totalPages = Math.ceil(total / size)

    const results = await db
      .select({
        alcohol: alcohols,
        wish: wishes
      })
      .from(wishes)
      .innerJoin(alcohols, eq(wishes.alcoholId, alcohols.id))
      .where(eq(wishes.userId, userId))
      .orderBy(sortColumn)
      .limit(size)
      .offset(offset)

    const items = results.map(row => ({
      id: row.alcohol.id,
      name: row.alcohol.name,
      image: row.alcohol.imageUrl,
      category: row.alcohol.categoryId.toString(),
      wish: row.alcohol.wishCnt,
      rating: row.alcohol.rating,
      viewCnt: row.alcohol.viewCnt,
      noteCnt: row.alcohol.noteCnt,
      isWish: true
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

  // ===== 노트 관련 =====
  
  // 내 노트 목록 조회
  static async getUserNotes(
    userId: number,
    query: any
  ): Promise<UserModel.NoteListResponse> {
    const { page = 1, size = 10 } = query
    
    // TODO: notes 테이블 구현 후
    return {
      items: [],
      pageUtil: {
        page,
        size,
        total: 0,
        totalPages: 0
      }
    }
  }

  // ===== 게시물 관련 =====
  
  // 내 게시물 목록 조회
  static async getUserPosts(
    userId: number,
    query: any
  ): Promise<UserModel.PostListResponse> {
    const { page = 1, size = 10 } = query
    
    // TODO: posts 테이블 구현 후
    return {
      items: [],
      pageUtil: {
        page,
        size,
        total: 0,
        totalPages: 0
      }
    }
  }

  // ===== Helper Methods =====
  
  private static async getWishCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishes)
      .where(eq(wishes.userId, userId))
    
    return Number(result[0]?.count || 0)
  }

  private static async getNoteCount(userId: number): Promise<number> {
    // TODO: notes 테이블 구현 후
    return 0
  }

  private static getSortColumn(sort: string) {
    const columnMap: Record<string, any> = {
      'CreatedAt': desc(wishes.createdAt),
      'View': desc(alcohols.viewCnt),
      'TastingNote': desc(alcohols.noteCnt),
      'Like': desc(alcohols.wishCnt),
      'Rating': desc(alcohols.rating),
      'PriceDesc': desc(alcohols.price),
      'PriceAsc': alcohols.price
    }
    
    return columnMap[sort] || desc(wishes.createdAt)
  }

  // 계정 삭제
  static async deleteAccount(userId: number): Promise<void> {
    // TODO: 관련 데이터 모두 삭제 (wishes, notes, posts 등)
    await db
      .delete(users)
      .where(eq(users.id, userId))
  }
}

// ===== Wish Service =====

export abstract class WishService {
  // 위시 추가
  static async addWish(userId: number, alcoholId: number): Promise<void> {
    const existing = await db
      .select()
      .from(wishes)
      .where(and(
        eq(wishes.userId, userId),
        eq(wishes.alcoholId, alcoholId)
      ))
      .limit(1)
      .get()

    if (existing) {
      throw new Error('Already wished')
    }

    await db.insert(wishes).values({
      userId,
      alcoholId,
      createdAt: new Date()
    })

    await db
      .update(alcohols)
      .set({ wishCnt: sql`${alcohols.wishCnt} + 1` })
      .where(eq(alcohols.id, alcoholId))
  }

  // 위시 삭제
  static async removeWish(userId: number, alcoholId: number): Promise<void> {
    const result = await db
      .delete(wishes)
      .where(and(
        eq(wishes.userId, userId),
        eq(wishes.alcoholId, alcoholId)
      ))
      .returning()

    if (!result.length) {
      throw new Error('Wish not found')
    }

    await db
      .update(alcohols)
      .set({ wishCnt: sql`${alcohols.wishCnt} - 1` })
      .where(eq(alcohols.id, alcoholId))
  }

  // 위시 여부 확인
  static async isWished(userId: number, alcoholId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(wishes)
      .where(and(
        eq(wishes.userId, userId),
        eq(wishes.alcoholId, alcoholId)
      ))
      .limit(1)
      .get()

    return !!result
  }
}