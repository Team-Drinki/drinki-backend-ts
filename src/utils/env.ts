import 'dotenv/config'

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export const config = {
  ACCESS_JWT_SECRET: getEnv('ACCESS_JWT_SECRET'),
  REFRESH_JWT_SECRET: getEnv('REFRESH_JWT_SECRET'),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: getEnv('GOOGLE_REDIRECT_URI'),
  CLIENT_URL: getEnv('CLIENT_URL')
} as const
