// modules/user/service.ts (수정)
import { eq, sql } from "drizzle-orm";
import { db } from "../../plugins/database";
import { users } from "../../db/schema";
import { Wish } from "../wish/service";
import type {
  UserProfile,
  PublicProfile,
  ProfileUpdateRequest,
  NoteListResponse,
  PostListResponse,
} from "./model";

export abstract class User {
  // ===== 프로필 관련 =====

  // 내 프로필 조회
  static async getUserProfile(userId: number): Promise<UserProfile> {
    const user = await db
      .select({
        id: users.id,
        socialType: users.socialType,
        socialId: users.socialId,
        nickname: users.nickname,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .get();

    if (!user) {
      throw new Error("User not found");
    }

    const [wishCount, noteCount] = await Promise.all([
      Wish.getWishCount(userId),
      this.getNoteCount(userId),
    ]);

    return {
      id: user.id,
      socialType: user.socialType,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      wishCnt: wishCount,
      noteCnt: noteCount,
      createdAt: user.createdAt,
    };
  }

  // 공개 프로필 조회
  static async getPublicProfile(userId: number): Promise<PublicProfile> {
    const user = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .get();

    if (!user) {
      throw new Error("User not found");
    }

    const [wishCount, noteCount] = await Promise.all([
      Wish.getWishCount(userId),
      this.getNoteCount(userId),
    ]);

    return {
      id: user.id,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      wishCnt: wishCount,
      noteCnt: noteCount,
      createdAt: user.createdAt,
    };
  }

  // 프로필 업데이트
  static async updateUserProfile(
    userId: number,
    request: ProfileUpdateRequest,
  ): Promise<UserProfile> {
    const updateData: any = {};

    if (request.nickname !== undefined) {
      updateData.nickname = request.nickname;
    }
    if (request.profileImageUrl !== undefined) {
      updateData.profileImageUrl = request.profileImageUrl;
    }

    updateData.updatedAt = new Date();

    await db.update(users).set(updateData).where(eq(users.id, userId));

    return this.getUserProfile(userId);
  }

  // ===== 노트 관련 =====

  // 내 노트 목록 조회
  static async getUserNotes(
    userId: number,
    query: any,
  ): Promise<NoteListResponse> {
    const { page = 1, size = 10 } = query;

    // TODO: notes 테이블 구현 후
    return {
      items: [],
      pageUtil: {
        page,
        size,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // ===== 게시물 관련 =====

  // 내 게시물 목록 조회
  static async getUserPosts(
    userId: number,
    query: any,
  ): Promise<PostListResponse> {
    const { page = 1, size = 10 } = query;

    // TODO: posts 테이블 구현 후
    return {
      items: [],
      pageUtil: {
        page,
        size,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // ===== Helper Methods =====

  private static async getNoteCount(userId: number): Promise<number> {
    // TODO: notes 테이블 구현 후
    return 0;
  }

  // 계정 삭제
  static async deleteAccount(userId: number): Promise<void> {
    // TODO: 관련 데이터 모두 삭제 (wishes, notes, posts 등)
    await db.delete(users).where(eq(users.id, userId));
  }
}
