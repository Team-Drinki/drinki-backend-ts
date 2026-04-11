// modules/wish/service.ts
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../plugins/database";
import { wishes, alcohols } from "../../db/schema";
import type { WishListRequest, WishListResponse } from "./model";

export abstract class Wish {
  // ===== 위시리스트 조회 =====

  // 내 위시리스트 조회
  static async getMyWishList(
    userId: number,
    request: WishListRequest,
  ): Promise<WishListResponse> {
    return this.getWishList(userId, request);
  }

  // 특정 사용자 위시리스트 조회 (공개)
  static async getUserWishList(
    userId: number,
    request: WishListRequest,
  ): Promise<WishListResponse> {
    // TODO: 공개 여부 체크
    return this.getWishList(userId, request);
  }

  // 위시리스트 조회 공통 로직
  private static async getWishList(
    userId: number,
    request: WishListRequest,
  ): Promise<WishListResponse> {
    const { page = 1, size = 10, sort = "CreatedAt" } = request;
    const offset = (page - 1) * size;

    const sortColumn = this.getSortColumn(sort);

    // 전체 개수
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishes)
      .where(eq(wishes.userId, userId));

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / size);

    // 데이터 조회
    const results = await db
      .select({
        alcohol: alcohols,
        wish: wishes,
      })
      .from(wishes)
      .innerJoin(alcohols, eq(wishes.alcoholId, alcohols.id))
      .where(eq(wishes.userId, userId))
      .orderBy(sortColumn)
      .limit(size)
      .offset(offset);

    const items = results.map((row) => ({
      id: row.alcohol.id,
      name: row.alcohol.name,
      image: row.alcohol.imageUrl,
      category: row.alcohol.categoryId.toString(),
      wish: row.alcohol.wishCnt,
      rating: row.alcohol.rating,
      viewCnt: row.alcohol.viewCnt,
      noteCnt: row.alcohol.noteCnt,
      isWish: true,
    }));

    return {
      items,
      pageUtil: {
        page,
        size,
        total,
        totalPages,
      },
    };
  }

  // ===== 위시 관리 =====

  // 위시 여부 확인
  static async isWished(userId: number, alcoholId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(wishes)
      .where(and(eq(wishes.userId, userId), eq(wishes.alcoholId, alcoholId)))
      .limit(1);

    return !!result;
  }

  // 위시 추가
  static async addWish(userId: number, alcoholId: number): Promise<void> {
    const [existing] = await db
      .select()
      .from(wishes)
      .where(and(eq(wishes.userId, userId), eq(wishes.alcoholId, alcoholId)))
      .limit(1);

    if (existing) {
      throw new Error("Already wished");
    }

    await db.insert(wishes).values({
      userId,
      alcoholId,
      createdAt: new Date(),
    });

    // alcohols 테이블의 wishCnt 증가
    await db
      .update(alcohols)
      .set({ wishCnt: sql`${alcohols.wishCnt} + 1` })
      .where(eq(alcohols.id, alcoholId));
  }

  // 위시 삭제
  static async removeWish(userId: number, alcoholId: number): Promise<void> {
    const result = await db
      .delete(wishes)
      .where(and(eq(wishes.userId, userId), eq(wishes.alcoholId, alcoholId)))
      .returning();

    if (!result.length) {
      throw new Error("Wish not found");
    }

    // alcohols 테이블의 wishCnt 감소
    await db
      .update(alcohols)
      .set({ wishCnt: sql`${alcohols.wishCnt} - 1` })
      .where(eq(alcohols.id, alcoholId));
  }

  // ===== Helper Methods =====

  private static getSortColumn(sort: string) {
    const columnMap: Record<string, any> = {
      CreatedAt: desc(wishes.createdAt),
      View: desc(alcohols.viewCnt),
      TastingNote: desc(alcohols.noteCnt),
      Like: desc(alcohols.wishCnt),
      Rating: desc(alcohols.rating),
      PriceDesc: desc(alcohols.price),
      PriceAsc: alcohols.price,
    };

    return columnMap[sort] || desc(wishes.createdAt);
  }

  // 위시 개수 조회
  static async getWishCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishes)
      .where(eq(wishes.userId, userId));

    return Number(result[0]?.count || 0);
  }
}
