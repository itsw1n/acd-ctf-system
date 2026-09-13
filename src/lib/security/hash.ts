import 'server-only'
import argon2 from 'argon2'
import { createHash, randomBytes } from 'node:crypto'

export function sha256(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

/** Argon2id hash for passwords. NEVER use plain SHA-256 for passwords. */
export async function hashPassword(password: string) {
  return argon2.hash(password)
}

/** Server-side only. Resolves false for wrong passwords; throws never on mismatch. */
export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await argon2.verify(passwordHash, password)
  } catch {
    return false
  }
}

const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function createRecoveryCode() {
  // 12 random chars (60 bits) in 3 unambiguous groups, prefixed for recognition.
  // Rejection sampling: skip byte values that would make `%` biased.
  const limit = 256 - (256 % RECOVERY_ALPHABET.length)
  let value = ''

  while (value.length < 12) {
    const byte = randomBytes(1)[0]
    if (byte >= limit) continue
    value += RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length]
  }

  return `ACD-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`
}
