import 'server-only'
import { createHash, randomBytes } from 'node:crypto'

export function sha256(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function createRecoveryCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(12)
  let value = ''

  for (let i = 0; i < 12; i += 1) {
    value += alphabet[bytes[i] % alphabet.length]
  }

  return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`
}
