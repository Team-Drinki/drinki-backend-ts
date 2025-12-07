import { Elysia } from 'elysia'
import openapi from '@elysiajs/openapi'

import { alcohol } from './modules/alcohol'
// import { userController } from './modules/user'
// import { tastingNoteController } from './modules/tasting-note'

const app = new Elysia()
  .use(openapi())
  .group('/api/v1', app => app
    .use(alcohol)
    // .use(userController)
    // .use(tastingNoteController)
  )
  .get('/', () => 'Drinki API v1.0.0')
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)