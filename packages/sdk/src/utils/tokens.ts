import fs from 'fs'
import path from 'path'
import { generateId } from './id'

const filePath = path.resolve(__dirname, '../../dev-data/tokens.json')

function readStore(): Record<string, any> {
  try {
    if (!fs.existsSync(filePath)) return {}
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return {}
  }
}

function writeStore(data: Record<string, any>) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export function saveRefreshToken(userId: string, ttlSeconds = 30 * 24 * 60 * 60) {
  const store = readStore()
  const token = generateId()
  const expiresAt = Date.now() + ttlSeconds * 1000
  store[token] = { userId, rotationCount: 0, expiresAt }
  writeStore(store)
  return token
}

export function verifyAndRotateRefreshToken(token: string) {
  const store = readStore()
  const rec = store[token]
  if (!rec) return null
  if (Date.now() > rec.expiresAt) {
    delete store[token]
    writeStore(store)
    return null
  }
  // rotate: remove old token and issue a new one
  delete store[token]
  const newToken = generateId()
  store[newToken] = { userId: rec.userId, rotationCount: (rec.rotationCount || 0) + 1, expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) }
  writeStore(store)
  return { userId: rec.userId, newToken }
}

export function revokeRefreshToken(token: string) {
  const store = readStore()
  if (store[token]) {
    delete store[token]
    writeStore(store)
  }
}
