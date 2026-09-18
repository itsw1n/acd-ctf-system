import { describe, expect, it, vi } from 'vitest'

import { decryptFlag, encryptFlag } from './flagCrypto'

const TEST_KEY = '0'.repeat(64)
const OTHER_KEY = 'f'.repeat(64)

describe('flagCrypto', () => {
  it('round-trips a flag through encrypt/decrypt', () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    expect(decryptFlag(encryptFlag('ACD{hello}'))).toBe('ACD{hello}')
    vi.unstubAllEnvs()
  })

  it('produces different ciphertext for identical flags (random IV)', () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    expect(encryptFlag('ACD{same}')).not.toBe(encryptFlag('ACD{same}'))
    vi.unstubAllEnvs()
  })

  it('rejects tampered payloads without leaking details', () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    const [version, iv, data] = encryptFlag('ACD{hello}').split('.')
    const tampered = `${version}.${iv}.${data.slice(0, -2)}00`
    expect(() => decryptFlag(tampered)).toThrow('FLAG_DECRYPT_FAILED')
    vi.unstubAllEnvs()
  })

  it('rejects decryption with the wrong key', () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    const payload = encryptFlag('ACD{hello}')
    vi.stubEnv('FLAG_ENCRYPTION_KEY', OTHER_KEY)
    expect(() => decryptFlag(payload)).toThrow('FLAG_DECRYPT_FAILED')
    vi.unstubAllEnvs()
  })

  it('rejects malformed payloads', () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    expect(() => decryptFlag('not-a-payload')).toThrow('FLAG_DECRYPT_FAILED')
    expect(() => decryptFlag('v2.00.00')).toThrow('FLAG_DECRYPT_FAILED')
    vi.unstubAllEnvs()
  })

  it('refuses to encrypt without a valid key', () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', '')
    expect(() => encryptFlag('ACD{hello}')).toThrow('FLAG_ENCRYPTION_MISCONFIGURED')
    vi.stubEnv('FLAG_ENCRYPTION_KEY', 'too-short')
    expect(() => encryptFlag('ACD{hello}')).toThrow('FLAG_ENCRYPTION_MISCONFIGURED')
    vi.unstubAllEnvs()
  })
})
