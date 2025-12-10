import { Elysia } from 'elysia'
import { AuthTokenService } from './authTokenService'

export const authGuard = (app: Elysia) =>
    app.derive(async ({ cookie, accessJwt, set }) => {
            const accessToken = cookie.accessToken?.value

            if (!accessToken) {
                set.status = 401
                throw new Error('Unauthorized: No access token')
            }

            try {
                const userId = await AuthTokenService.getUserIdFromAccessToken(
                    accessToken,
                    accessJwt
                )
                console.log('[authGuard] userId =', userId)
                
                return {
                    authUser: {
                        userId: userId
                    }
                }
            } catch (err) {
                set.status = 401
                throw new Error('Unauthorized: Invalid or expired token')
            }
        })