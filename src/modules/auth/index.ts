import { Elysia } from 'elysia'
import { t } from 'elysia'
import { config } from '../../utils/env'
import { GoogleAuthService } from './service'

const isProduction = process.env.NODE_ENV === 'production'

export const auth = (app: Elysia) => 
    app.group('/auth', app =>
        app
            .get('/login/google', ({ set, cookie }) => {
                const state = crypto.randomUUID()
                cookie.oauthState.set({
                    value: state,
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    path: '/',
                    maxAge: 60 * 5 // 5분
                })
                console.log('[login] generated state =', state)
                const redirect = GoogleAuthService.buildAuthUrl(state)
                set.status = 302
                set.headers['Location'] = redirect
                return redirect
            })

            .get('/callback/google', async ({ query, cookie, set, request, accessJwt, refreshJwt }) => {
                const { code, state } = query

                console.log('[callback] full url =', request.url)
                console.log('[callback] query =', query)
                console.log('[before] raw Cookie header =', request.headers.get('cookie'))
                console.log('[before] accessToken =', cookie.accessToken?.value)
                console.log('[before] refreshToken =', cookie.refreshToken?.value)

                const cookieState = cookie.oauthState?.value
                if (!state || !cookieState || state !== cookieState) {
                    set.status = 400
                    return { message: 'Invalid state' }
                }
                console.log('[callback] validated state =', state, cookieState)
                cookie.oauthState?.remove()

                const tokens = await GoogleAuthService.getTokenFromCode(code)
                const googleUser = await GoogleAuthService.getUserInfo(tokens.access_token)
                console.log('[callback] googleUser =', googleUser)

                const user = await GoogleAuthService.findOrCreateUser({
                    sub: googleUser.sub,
                    email: googleUser.email,
                    name: googleUser.name,
                    picture: googleUser.picture
                })
                console.log('[callback] our user =', user)

                const payload = {
                    userId: user.id
                }

                const accessToken = await accessJwt.sign({
                    ...payload,
                    type: 'access'
                })
                const refreshToken = await refreshJwt.sign({
                    ...payload,
                    type: 'refresh'
                })

                cookie.accessToken.set({
                    value: accessToken,
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    path: '/',
                    maxAge: 60 * 10 // 10분
                })
                cookie.refreshToken.set({
                    value: refreshToken,
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7일
                })

                console.log('[after] accessToken =', cookie.accessToken.value)
                console.log('[after] refreshToken =', cookie.refreshToken.value)

                set.status = 302
                set.headers['Location'] = config.CLIENT_URL
            },
            {
                query: t.Object({
                    code: t.String(),
                    state: t.Optional(t.String())
                })
            })
            .post('/logout', ({ cookie, set }) => {
                cookie.accessToken.remove()
                cookie.refreshToken.remove()
                set.status = 204
            })
            .post('/refresh', async ({ cookie, set, accessJwt, refreshJwt }) => {
                const refreshToken = cookie.refreshToken?.value
                if (!refreshToken) {
                    set.status = 401
                    return { message: 'No refresh token' }
                }

                let decoded
                try {
                    decoded = await refreshJwt.verify(refreshToken)
                    if (decoded.type !== 'refresh') {
                        throw new Error('Not a refresh token')
                    }
                    console.log('[refresh] refreshToken =', refreshToken)
                    console.log('[refresh] decoded refreshToken =', decoded)
                } catch (e) {
                    set.status = 401
                    return { message: 'Invalid refresh token' }
                }

                const payload = {
                    userId: decoded.userId
                }

                const newAccessToken = await accessJwt.sign({
                    ...payload,
                    type: 'access'
                })

                cookie.accessToken.set({
                    value: newAccessToken,
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    path: '/',
                    maxAge: 60 * 10 // 10분
                })
                console.log('[refresh] new accessToken =', cookie.accessToken.value)

                set.status = 204
            })
    )
