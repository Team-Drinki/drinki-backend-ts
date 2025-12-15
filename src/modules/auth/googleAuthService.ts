import { config } from '../../utils/env'
import { db } from '../../plugins/database';
import { users } from '../../db/schema/Users';
import { eq, and } from 'drizzle-orm';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export class GoogleAuthService {
    static buildAuthUrl(state: string) {
        const url = new URL(GOOGLE_AUTH_URL)
        url.searchParams.set('client_id', config.GOOGLE_CLIENT_ID)
        url.searchParams.set('redirect_uri', config.GOOGLE_REDIRECT_URI)
        url.searchParams.set('response_type', 'code')
        url.searchParams.set('scope', [
            'openid',
            'email',
            'profile'
        ].join(' '))
        url.searchParams.set('state', state)
        return url.toString()
    }

    static async getTokenFromCode(code: string) {
        const params = new URLSearchParams()
        params.append('code', code)
        params.append('client_id', config.GOOGLE_CLIENT_ID)
        params.append('client_secret', config.GOOGLE_CLIENT_SECRET)
        params.append('redirect_uri', config.GOOGLE_REDIRECT_URI)
        params.append('grant_type', 'authorization_code')
        
        const response = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        })

        if (!response.ok) {
            throw new Error('Google login: Failed to get token from code')
        }
        return response.json()
    }

    static async getUserInfo(accessToken: string) {
        const response = await fetch(GOOGLE_USER_INFO_URL, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Google login: Failed to fetch user info')
        }
        return response.json()
    }

    static async findOrCreateUser(googleUser: {
        sub: string,
        email: string,
        name: string,
        picture: string
    }) {
            const user = await db.select()
            .from(users)
            .where(
                and(
                    eq(users.socialType, 'google'),
                    eq(users.socialId, googleUser.sub)
                )
            )
            .limit(1)
            .get()
        
        if (user) {
            return user
        }

        const newUser = {
            socialType: 'google',
            socialId: googleUser.sub,
            nickname: googleUser.name,
            profileImageUrl: googleUser.picture,
        }

        const insertedUsers = await db.insert(users)
            .values(newUser).returning()
        return insertedUsers[0]
    }




}