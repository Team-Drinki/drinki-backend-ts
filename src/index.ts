import { Elysia } from 'elysia'
import openapi from '@elysiajs/openapi'

import { alcohol } from './modules/alcohol'
// import { userController } from './modules/user'
// import { tastingNoteController } from './modules/tasting-note'

const app = new Elysia()
  .use(openapi())
  .get("/", () => "Hello Elysia")
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)