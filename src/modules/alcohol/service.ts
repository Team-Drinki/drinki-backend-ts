import { status } from 'elysia'
import { eq, and, like, gte, lte, desc, asc, sql } from 'drizzle-orm'

import { AlcoholModel } from './model'
import { db } from '../../plugins/database';
import { alcoholCategories, alcoholLocations, alcohols, alcoholStyles } from '../../db/schema';

export abstract class Alcohol {
  static async findById(alcoholId: number) {
    const result = await db
      .select({
        alcohol: alcohols,
        category: alcoholCategories,
        location: alcoholLocations,
        style: alcoholStyles 
      })
      .from(alcohols)
      .leftJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .leftJoin(alcoholLocations, eq(alcohols.locationId, alcoholLocations.id))
      .leftJoin(alcoholStyles, eq(alcohols.styleId, alcoholStyles.id))
      .where(eq(alcohols.id, alcoholId))
      .limit(1);

    if (!result[0]) {
      throw new Error('Alcohol not found');
    }

    // 조회수 증가
    await db
      .update(alcohols)
      .set({ viewCnt: sql`${alcohols.viewCnt} + 1` })
      .where(eq(alcohols.id, alcoholId));

    return {
      ...result[0].alcohol,
      category: result[0].category,
      location: result[0].location,
      style: result[0].style
    };
  }

  static async search(params: AlcoholModel.AlcoholSearchParams)
    :Promise<AlcoholModel.AlcoholSearchResponse> {
    const {
      page = 1,
      size = 20,
      sort = 'createdAt:desc',
      query: searchQuery,
      categoryId,
      locationId,
      styleId,
      priceMin,
      priceMax,
      rating
    } = params;

    // 정렬 파싱
    const [sortField = 'createdAt', sortOrder = 'desc'] = sort.split(':');

    // WHERE 조건 구성
    const conditions = [];
    
    if (searchQuery) {
      conditions.push(like(alcohols.name, `%${searchQuery}%`));
    }
    if (categoryId) {
      conditions.push(eq(alcohols.categoryId, categoryId));
    }
    if (locationId) {
      conditions.push(eq(alcohols.locationId, locationId));
    }
    if (styleId) {
      conditions.push(eq(alcohols.styleId, styleId));
    }
    if (priceMin !== undefined) {
      conditions.push(gte(alcohols.price, priceMin));
    }
    if (priceMax !== undefined) {
      conditions.push(lte(alcohols.price, priceMax));
    }
    if (rating !== undefined) {
      conditions.push(gte(alcohols.rating, rating));
    }

    // 전체 개수 조회
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(alcohols)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / size);

    // 데이터 조회 with joins
    const orderByColumn = this.getSortColumn(sortField);
    const orderByDirection = sortOrder === 'asc' ? asc : desc;
    
    const results = await db
      .select({
        alcohol: alcohols,
        category: alcoholCategories,
        location: alcoholLocations,
        style: alcoholStyles
      })
      .from(alcohols)
      .leftJoin(alcoholCategories, eq(alcohols.categoryId, alcoholCategories.id))
      .leftJoin(alcoholLocations, eq(alcohols.locationId, alcoholLocations.id))
      .leftJoin(alcoholStyles, eq(alcohols.styleId, alcoholStyles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderByDirection(orderByColumn))
      .limit(size)
      .offset((page - 1) * size);

    // 응답 구성
    return {
      data: results.map(row => ({
        ...row.alcohol,
        category: row.category,
        location: row.location,
        style: row.style
      })),
      pagination: {
        page,
        size,
        total,
        totalPages
      },
      filters: {
        query: searchQuery,
        categoryId,
        locationId,
        styleId,
        priceRange: { min: priceMin, max: priceMax },
        rating
      },
      sort: { 
        field: sortField, 
        order: sortOrder as 'asc' | 'desc' 
      }
    };
  }

  static async getRecommendations(userId?: number, limit: number = 10) {
    // 추천 알고리즘: 높은 평점, 많은 위시리스트, 최근 인기
    const recommendations = await db
      .select()
      .from(alcohols)
      .orderBy(
        desc(alcohols.rating),
        desc(alcohols.wishCnt),
        desc(alcohols.viewCnt)
      )
      .limit(limit);

    return { recommendations };
  }

  private static getSortColumn(field: string) {
    const columnMap: Record<string, any> = {
      'name': alcohols.name,
      'price': alcohols.price,
      'rating': alcohols.rating,
      'createdAt': alcohols.createdAt,
      'created_at': alcohols.createdAt,
      'viewCnt': alcohols.viewCnt,
      'wishCnt': alcohols.wishCnt
    };
    
    return columnMap[field] || alcohols.createdAt;
  }
}