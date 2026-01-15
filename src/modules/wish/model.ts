import { t } from "elysia";
import type { Static } from "@sinclair/typebox";

// ===== 위시 스키마 =====

export const wishListRequest = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, maximum: 1000, default: 1 })),
  size: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  sort: t.Optional(
    t.Union(
      [
        t.Literal("CreatedAt"),
        t.Literal("View"),
        t.Literal("TastingNote"),
        t.Literal("Like"),
        t.Literal("Rating"),
        t.Literal("PriceDesc"),
        t.Literal("PriceAsc"),
      ],
      { default: "CreatedAt" },
    ),
  ),
});

export const wishItem = t.Object({
  id: t.Number(),
  name: t.String(),
  image: t.String(),
  category: t.String(),
  wish: t.Number(),
  rating: t.Number(),
  viewCnt: t.Number(),
  noteCnt: t.Number(),
  isWish: t.Boolean(),
});

export const wishListResponse = t.Object({
  items: t.Array(wishItem),
  pageUtil: t.Object({
    page: t.Number(),
    size: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
});

// ===== 타입 추출 =====

export type WishListRequest = Static<typeof wishListRequest>;
export type WishItem = Static<typeof wishItem>;
export type WishListResponse = Static<typeof wishListResponse>;
