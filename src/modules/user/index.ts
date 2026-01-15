import { Elysia } from "elysia";
import { User } from "./service";
import {
  userProfile,
  publicProfile,
  profileUpdateRequest,
  paginationParams,
  userIdParam,
  noteListResponse,
  postListResponse,
} from "./model";

export const user = new Elysia({
  prefix: "/users",
})
  // ===== 내 정보 관리 =====

  // 내 정보 조회
  .get(
    "/my",
    async ({ authUser }: any) => {
      return await User.getUserProfile(authUser.userId);
    },
    {
      response: {
        200: userProfile,
      },
      detail: {
        summary: "내 정보 조회 API",
        tags: ["User"],
      },
    },
  )

  // 내 정보 수정
  .post(
    "/my",
    async ({ authUser, body }: any) => {
      return await User.updateUserProfile(authUser.userId, body);
    },
    {
      body: profileUpdateRequest,
      response: {
        200: userProfile,
      },
      detail: {
        summary: "내 정보 수정 API",
        tags: ["User"],
      },
    },
  )

  // ===== 내 컬렉션 조회 =====

  // 내 테이스팅 노트 리스트 조회
  .get(
    "/my/notes",
    async ({ authUser, query }: any) => {
      return await User.getUserNotes(authUser.userId, query);
    },
    {
      query: paginationParams,
      response: {
        200: noteListResponse,
      },
      detail: {
        summary: "내 테이스팅 노트 리스트 조회 API",
        tags: ["User", "Note"],
      },
    },
  )

  // 내 커뮤니티 글 리스트 조회
  .get(
    "/my/posts",
    async ({ authUser, query }: any) => {
      return await User.getUserPosts(authUser.userId, query);
    },
    {
      query: paginationParams,
      response: {
        200: postListResponse,
      },
      detail: {
        summary: "내 커뮤니티 글 리스트 조회 API",
        tags: ["User", "Post"],
      },
    },
  )

  // ===== 특정 사용자 정보 조회 =====

  // 특정 사용자 정보 조회
  .get(
    "/:userId",
    async ({ params }: any) => {
      return await User.getPublicProfile(params.userId);
    },
    {
      params: userIdParam,
      response: {
        200: publicProfile,
      },
      detail: {
        summary: "특정 사용자 정보 조회 API",
        tags: ["User"],
      },
    },
  );
