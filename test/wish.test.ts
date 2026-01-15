// __tests__/wish.test.ts
import { describe, expect, test, beforeAll, mock } from "bun:test";
import { createTestApp, createTestToken } from "./setup";
import type { Elysia } from "elysia";

describe("Wish API", () => {
  let app: Elysia;
  let validToken: string;

  beforeAll(async () => {
    app = createTestApp();
    validToken = await createTestToken(app, 1);
  });

  // ===== 내 위시리스트 테스트 =====

  describe("My Wish Management", () => {
    describe("GET /api/v1/wishes/my", () => {
      test("should return my wish list", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            getMyWishList: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 1,
                  name: "와인1",
                  image: "wine1.jpg",
                  category: "Wine",
                  wish: 100,
                  rating: 4.5,
                  viewCnt: 500,
                  noteCnt: 10,
                  isWish: true,
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
          new Request("http://localhost/api/v1/wishes/my?page=1&size=10", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.items).toHaveLength(1);
        expect(body.items[0].name).toBe("와인1");
        expect(body.items[0].isWish).toBe(true);
      });

      test("should return empty list when no wishes", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            getMyWishList: mock(async () => ({
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
          new Request("http://localhost/api/v1/wishes/my", {
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
          new Request("http://localhost/api/v1/wishes/my?page=2&size=5", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
      });

      test("should support sorting", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my?sort=Rating", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
      });

      test("should return 401 without token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my"),
        );

        expect(response.status).toBe(401);
      });
    });

    describe("GET /api/v1/wishes/my/alcohol/:alcoholId", () => {
      test("should check if specific alcohol is wished", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            isWished: mock(async () => true),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.isWished).toBe(true);
      });

      test("should return false if not wished", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            isWished: mock(async () => false),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/456", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.isWished).toBe(false);
      });

      test("should return 401 without token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123"),
        );

        expect(response.status).toBe(401);
      });
    });

    describe("POST /api/v1/wishes/my/alcohol/:alcoholId", () => {
      test("should add alcohol to wish list", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            addWish: mock(async () => {}),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123", {
            method: "POST",
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      test("should return error if already wished", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            addWish: mock(async () => {
              throw new Error("Already wished");
            }),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123", {
            method: "POST",
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(500);
      });

      test("should return 401 without token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123", {
            method: "POST",
          }),
        );

        expect(response.status).toBe(401);
      });
    });

    describe("DELETE /api/v1/wishes/my/alcohol/:alcoholId", () => {
      test("should remove alcohol from wish list", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            removeWish: mock(async () => {}),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123", {
            method: "DELETE",
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(204);
      });

      test("should return error if wish not found", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            removeWish: mock(async () => {
              throw new Error("Wish not found");
            }),
          },
        }));

        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123", {
            method: "DELETE",
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(500);
      });

      test("should return 401 without token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/my/alcohol/123", {
            method: "DELETE",
          }),
        );

        expect(response.status).toBe(401);
      });
    });
  });

  // ===== 특정 사용자 위시리스트 테스트 =====

  describe("Public Wish APIs", () => {
    describe("GET /api/v1/wishes/wishes/:userId", () => {
      test("should return user wish list", async () => {
        mock.module("../src/modules/wish/service", () => ({
          Wish: {
            getUserWishList: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 2,
                  name: "위스키",
                  image: "whiskey.jpg",
                  category: "Whiskey",
                  wish: 50,
                  rating: 4.8,
                  viewCnt: 300,
                  noteCnt: 5,
                  isWish: false, // 다른 사용자 것이므로
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
          new Request("http://localhost/api/v1/wishes/wishes/123", {
            headers: {
              Cookie: `accessToken=${validToken}`,
            },
          }),
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.items).toHaveLength(1);
        expect(body.items[0].name).toBe("위스키");
      });

      test("should support pagination and sorting", async () => {
        const response = await app.handle(
          new Request(
            "http://localhost/api/v1/wishes/wishes/123?page=1&size=5&sort=Rating",
            {
              headers: {
                Cookie: `accessToken=${validToken}`,
              },
            },
          ),
        );

        expect(response.status).toBe(200);
      });

      test("should return 401 without token", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/v1/wishes/wishes/123"),
        );

        expect(response.status).toBe(401);
      });
    });
  });

  // ===== 인증 관련 테스트 =====

  describe("Authentication", () => {
    test("all endpoints should require authentication", async () => {
      const endpoints = [
        { method: "GET", url: "/api/v1/wishes/my" },
        { method: "GET", url: "/api/v1/wishes/my/alcohol/123" },
        { method: "POST", url: "/api/v1/wishes/my/alcohol/123" },
        { method: "DELETE", url: "/api/v1/wishes/my/alcohol/123" },
        { method: "GET", url: "/api/v1/wishes/wishes/123" },
      ];

      for (const endpoint of endpoints) {
        const response = await app.handle(
          new Request(`http://localhost${endpoint.url}`, {
            method: endpoint.method,
          }),
        );
        expect(response.status).toBe(401);
      }
    });
  });
});
