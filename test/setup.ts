import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { auth } from "../src/modules/auth";
import { authGuard } from "../src/modules/auth/middleware";
import { user } from "../src/modules/user";
import { wish } from "../src/modules/wish";
import { alcohol } from "../src/modules/alcohol";
import { config } from "../src/utils/env";

// 테스트용 앱 생성
export const createTestApp = () => {
  return new Elysia()
    .use(cookie())
    .use(
      jwt({
        name: "accessJwt",
        secret: config.ACCESS_JWT_SECRET || "test-access-secret",
        exp: "10m",
      }),
    )
    .use(
      jwt({
        name: "refreshJwt",
        secret: config.REFRESH_JWT_SECRET || "test-refresh-secret",
        exp: "7d",
      }),
    )
    .group("/api/v1", (app) =>
      app.use(auth).use(authGuard).use(user).use(wish).use(alcohol),
    );
};

// 테스트용 토큰 생성 헬퍼
export const createTestToken = async (app: Elysia, userId: number) => {
  const accessJwt = (app as any).decorator.accessJwt;
  const token = await accessJwt.sign({
    userId,
    type: "access",
  });
  return token;
};
