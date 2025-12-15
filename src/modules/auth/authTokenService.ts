export class AuthTokenService {
    static async getUserIdFromAccessToken(accessToken: string, accessJwt: any) {
        const decoded = await accessJwt.verify(accessToken)
        if (!decoded || decoded.type !== 'access') {
            throw new Error('Invalid access token')
        }

        return decoded.userId
    }

    static async issueTokens(userId: number, accessJwt: any, refreshJwt: any) {
        const accessToken = await this.issueAccessToken(userId, accessJwt)
        const refreshToken = await this.issueRefreshToken(userId, refreshJwt)

        return { accessToken, refreshToken }
    }

    static async refreshAccessToken(refreshToken: string, accessJwt: any, refreshJwt: any) {
        const decoded = await refreshJwt.verify(refreshToken)
        if (!decoded || decoded.type !== 'refresh') {
            throw new Error('Invalid refresh token')
        }

        console.log('[refresh] refreshToken =', refreshToken)
        console.log('[refresh] decoded refreshToken =', decoded)

        const newAccessToken = await this.issueAccessToken(decoded.userId, accessJwt)

        return newAccessToken
    }

    static async issueAccessToken(userId: number, accessJwt: any) {
        const payload = {
            userId: userId
        }

        const accessToken = await accessJwt.sign({
            ...payload,
            type: 'access'
        })

        return accessToken
    }

    static async issueRefreshToken(userId: number, refreshJwt: any) {
        const payload = {
            userId: userId
        }

        const refreshToken = await refreshJwt.sign({
            ...payload,
            type: 'refresh'
        })

        return refreshToken
    }
}