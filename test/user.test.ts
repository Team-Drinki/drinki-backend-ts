// __tests__/user.test.ts
import { describe, expect, test, beforeAll, mock } from "bun:test";
import { createTestApp, createTestToken } from "./setup";
import type { Elysia } from "elysia";

describe("User API", () => {
  let app: Elysia;
  let validToken: string;

  beforeAll(async () => {
    app = createTestApp();
    validToken = await createTestToken(app, 1);
  });

  // ===== 내 정보 관리 테스트 =====

  describe("My Profile Management", () => {
    describe("GET /api/v1/users/my", () => {
      test("should return my profile with valid token", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            getUserProfile: mock(async (userId: number) => ({
              id: userId,
              socialType: "google",
              nickname: "Test User",
              profileImageUrl: "https://example.com/image.jpg",
              wishCnt: 5,
              noteCnt: 3,
              createdAt: new Date("2024-01-01"),
            })),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.nickname).toBe("Test User");
        expect(body.wishCnt).toBe(5);
        expect(body.noteCnt).toBe(3);
      });

      test("should return 401 without token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my"),
        );

        expect(response.status).toBe(401);
      });

      test("should return 401 with invalid token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my", {
            headers: {
              Cookie: "accessToken=invalid-token",
            },
          }),
        );

        expect(response.status).toBe(401);
      });
    });

    describe("POST /api/v1/users/my", () => {
      test("should update my profile with valid data", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            updateUserProfile: mock(async (userId: number, data: any) => ({
              id: userId,
              socialType: "google",
              nickname: data.nickname || "Updated User",
              profileImageUrl:
                data.profileImageUrl || "https://example.com/new.jpg",
              wishCnt: 5,
              noteCnt: 3,
              createdAt: new Date(),
            })),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `accessToken=${validToken}`,
            },
            body: JSON.stringify({
              nickname: "Updated User",
              profileImageUrl: "https://example.com/new.jpg",
            }),
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.nickname).toBe("Updated User");
      });

      test("should update nickname only", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `accessToken=${validToken}`,
            },
            body: JSON.stringify({
              nickname: "New Nickname",
            }),
          }),
        );

        expect(response.status).toBe(200);
      });

      test("should return 422 with invalid nickname", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `accessToken=${validToken}`,
            },
            body: JSON.stringify({
              nickname: "A", // too short (minLength: 2)
            }),
          }),
        );

        expect(response.status).toBe(422);
      });
    });
  });

  // ===== 내 노트 테스트 =====

  describe("My Notes", () => {
    describe("GET /api/v1/users/my/notes", () => {
      test("should return my notes", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            getUserNotes: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 1,
                  alcoholId: 1,
                  alcoholName: "와인1",
                  alcoholImage: "wine1.jpg",
                  content: "좋은 와인입니다",
                  rating: 4.5,
                  createdAt: new Date("2024-01-01"),
                },
              ],
              pageUtil: {
                page: 1,
                size: 10,
                total: 1,
                totalPages: 1,
              },
            })),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my/notes?page=1&size=10", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.items).toHaveLength(1);
        expect(body.items[0].content).toBe("좋은 와인입니다");
      });

      test("should return empty list when no notes", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            getUserNotes: mock(async () => ({
              items: [],
              pageUtil: {
                page: 1,
                size: 10,
                total: 0,
                totalPages: 0,
              },
            })),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my/notes", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.items).toHaveLength(0);
      });

      test("should support pagination", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my/notes?page=2&size=5", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
      });
    });
  });

  // ===== 내 게시물 테스트 =====

  describe("My Posts", () => {
    describe("GET /api/v1/users/my/posts", () => {
      test("should return my posts", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            getUserPosts: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 1,
                  title: "와인 추천",
                  content: "오늘의 와인 추천입니다",
                  viewCnt: 100,
                  likeCnt: 10,
                  commentCnt: 5,
                  createdAt: new Date("2024-01-01"),
                },
              ],
              pageUtil: {
                page: 1,
                size: 10,
                total: 1,
                totalPages: 1,
              },
            })),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my/posts?page=1&size=10", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.items).toHaveLength(1);
        expect(body.items[0].title).toBe("와인 추천");
      });

      test("should return empty list when no posts", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            getUserPosts: mock(async () => ({
              items: [],
              pageUtil: {
                page: 1,
                size: 10,
                total: 0,
                totalPages: 0,
              },
            })),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/my/posts", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.items).toHaveLength(0);
      });
    });
  });

  // ===== 특정 사용자 정보 테스트 =====

  describe("Public User APIs", () => {
    describe("GET /api/v1/users/:userId", () => {
      test("should return public profile", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            getPublicProfile: mock(async (userId: number) => ({
              id: userId,
              nickname: "Public User",
              profileImageUrl: "https://example.com/public.jpg",
              wishCnt: 10,
              noteCnt: 5,
              createdAt: new Date("2024-01-01"),
            })),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/123", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.nickname).toBe("Public User");
        expect(body.socialType).toBeUndefined(); // 공개 프로필에는 socialType 없음
      });

      test("should return 500 when user not found", async () => {
        mock.module("../src/modules/user/service", () => ({
          User: {
            getPublicProfile: mock(async () => {
              throw new Error("User not found");
            }),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/users/99999", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(500);
      });

      test("should return 401 without token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/users/123"),
        );

        expect(response.status).toBe(401);
      });
    });
  });

  // ===== 인증 관련 테스트 =====

  describe("Authentication", () => {
    test("all endpoints should require authentication", async () => {
      const endpoints = [
        "/api/v1/users/my",
        "/api/v1/users/my/notes",
        "/api/v1/users/my/posts",
        "/api/v1/users/123",
      ];

      for (const endpoint of endpoints) {
        const response = await app.handle(
          new Request(`http://localhost${endpoint}`),
        );
        expect(response.status).toBe(401);
      }
    });
  });
});
