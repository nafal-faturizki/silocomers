import fs from 'fs'
import path from 'path'

const filePath = path.resolve(__dirname, '../../dev-data/otps.json')

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

export function sendOtp(to: string) {
  const store = readStore()
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expires = Date.now() + 5 * 60 * 1000
  store[to] = { code, expires }
  writeStore(store)
  // simulate send by logging
  // eslint-disable-next-line no-console
  console.log(`OTP for ${to}: ${code}`)
  return code
}

export function verifyOtp(to: string, code: string) {
  const store = readStore()
  const rec = store[to]
  if (!rec) return false
  if (Date.now() > rec.expires) {
    delete store[to]
    writeStore(store)
    return false
  }
  const ok = rec.code === code
  if (ok) {
    delete store[to]
    writeStore(store)
  }
  return ok
}
