import 'server-only'

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * Application-side flag encryption (AES-256-GCM) so challenge flags are
 * opaque at rest in the database and its backups.
 *
 * - Submissions never touch this module: scoring uses the SHA-256
 *   `flag_hash` only.
 * - Decryption happens server-side only, for the admin edit form.
 * - Key comes from `FLAG_ENCRYPTION_KEY` (64 hex chars = 32 bytes).
 *   Generate once with `openssl rand -hex 32`. Server-only env: never
 *   use a NEXT_PUBLIC_ prefix.
 * - Wire format is `v1.<iv-hex>.<ciphertext+tag-hex>` with a random
 *   12-byte IV per flag, so identical flags encrypt differently.
 * - All failures throw generic errors: never leak key material,
 *   plaintext, or which check failed.
 */
const ALGORITHM = 'aes-256-gcm'
const VERSION = 'v1'

function getKey(): Buffer {
  const hex = process.env.FLAG_ENCRYPTION_KEY
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('FLAG_ENCRYPTION_MISCONFIGURED')
  }
  return Buffer.from(hex, 'hex')
}

export function encryptFlag(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const payload = Buffer.concat([ciphertext, cipher.getAuthTag()]).toString('hex')
  return `${VERSION}.${iv.toString('hex')}.${payload}`
}

export function decryptFlag(payload: string): string {
  const [version, ivHex, dataHex] = payload.split('.')
  if (version !== VERSION || !ivHex || !dataHex) {
    throw new Error('FLAG_DECRYPT_FAILED')
  }
  try {
    const data = Buffer.from(dataHex, 'hex')
    const tag = data.subarray(data.length - 16)
    const ciphertext = data.subarray(0, data.length - 16)
    const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  } catch {
    throw new Error('FLAG_DECRYPT_FAILED')
  }
}
