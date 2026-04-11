import { Elysia } from "elysia";
import { t } from "elysia";
import openapi from "@elysiajs/openapi";

import { jwt } from "@elysiajs/jwt";
import { config } from "./utils/env";
import { auth } from "./modules/auth";
import { authGuard } from "./modules/auth/middleware";

import { alcohol } from "./modules/alcohol";
import { user } from "./modules/user";
import { wish } from "./modules/wish";
import { tastingnote } from "./modules/tastingnote";

const app = new Elysia()
  .use(openapi())
  .group(
    "/api/v1",
    (app) =>
      app
        .use(
          jwt({
            name: "accessJwt",
            secret: config.ACCESS_JWT_SECRET,
            exp: "10m",
            schema: t.Object({
              userId: t.Number(),
              type: t.String(),
            }),
          }),
        )
        .use(
          jwt({
            name: "refreshJwt",
            secret: config.REFRESH_JWT_SECRET,
            exp: "7d",
            schema: t.Object({
              userId: t.Number(),
              type: t.String(),
            }),
          }),
        )
        .use(auth)
        .use((app) => authGuard(app))
        // 테스트용 API(인증 미들웨어 확인)
        .get("/me", ({ authUser }) => {
          return {
            message: "OK",
            userId: authUser.userId,
          };
        })
        .use(alcohol)
        .use(user)
        .use(wish)
        .use(tastingnote),
  )
  .get("/", () => "Drinki API v1.0.0")
  .listen(Number(process.env.PORT) || 8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
