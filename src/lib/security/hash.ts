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
  // Rejection sampling: skip byte values that would make `%` biased.
  const limit = 256 - (256 % alphabet.length)
  let value = ''

  while (value.length < 12) {
    const byte = randomBytes(1)[0]
    if (byte >= limit) continue
    value += alphabet[byte % alphabet.length]
  }

  return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`
}
