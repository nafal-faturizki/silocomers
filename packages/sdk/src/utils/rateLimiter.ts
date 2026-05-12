import fs from 'fs'
import path from 'path'

const filePath = path.resolve(__dirname, '../../dev-data/rate.json')

function readStore() {
  try {
    if (!fs.existsSync(filePath)) return {}
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (e) {
    return {}
  }
}

function writeStore(data: Record<string, any>) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// Simple fixed-window limiter per key
export function allow(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const store = readStore()
  const now = Date.now()
  const rec = store[key] || { count: 0, windowStart: now }
  if (now - rec.windowStart > windowMs) {
    rec.count = 0
    rec.windowStart = now
  }
  if (rec.count >= limit) {
    return false
  }
  rec.count = rec.count + 1
  store[key] = rec
  writeStore(store)
  return true
}
