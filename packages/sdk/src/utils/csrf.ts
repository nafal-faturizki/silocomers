import { randomBytes } from 'crypto'

const COOKIE_NAME = 'csrf_token'

export function generateCsrfToken() {
  return randomBytes(16).toString('hex')
}

export function getCookieToken(cookies: string | undefined) {
  if (!cookies) return null
  const parts = cookies.split(';').map(p => p.trim())
  for (const p of parts) {
    if (p.startsWith(COOKIE_NAME + '=')) return p.split('=')[1]
  }
  return null
}

export { COOKIE_NAME }
