import { Elysia } from 'elysia'
import openapi from '@elysiajs/openapi'
import { jwt } from '@elysiajs/jwt'
import { config } from './utils/env'
import { alcohol } from './modules/alcohol'
import { auth } from './modules/auth'
import { t } from 'elysia'
// import { tastingNoteController } from './modules/tasting-note'

const app = new Elysia()
  .use(openapi())
  .group('/api/v1', app => app
    .use(
      jwt({
        name: 'accessJwt',
        secret: config.ACCESS_JWT_SECRET,
        exp: '10m',
        schema: t.Object({
          userId: t.Number(),
          type: t.String()
        })
      })
    )
    .use(
      jwt({
        name: 'refreshJwt',
        secret: config.REFRESH_JWT_SECRET,
        exp: '7d',
        schema: t.Object({
          userId: t.Number(),
          type: t.String()
        })
      })
    )
    .use(alcohol)
    .use(auth)
    // .use(tastingNoteController)
  )
  .get('/', () => 'Drinki API v1.0.0')
  .listen(8000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)