import env from '#start/env'

export const jwtConfig = {
    guard: 'jwt',
    jwt: {
        driver: 'jwt',
        secret: env.get('JWT_SECRET'),
        accessTokenExpiresIn: '1d',
        refreshTokenExpiresIn: '7d',
    },
}
