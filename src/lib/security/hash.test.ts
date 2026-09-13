import { describe, expect, it } from 'vitest'
import { createRecoveryCode, hashPassword, sha256, verifyPassword } from './hash'

describe('security hashing', () => {
  it('returns a deterministic SHA-256 digest', () => {
    expect(sha256('ACD{test}')).toBe(sha256('ACD{test}'))
    expect(sha256('ACD{test}')).not.toBe(sha256('ACD{other}'))
  })

  it('creates a grouped recovery code', () => {
    expect(createRecoveryCode()).toMatch(/^ACD-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
  })

  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('0123456789')
    expect(hash).not.toContain('0123456789')
    expect(await verifyPassword(hash, '0123456789')).toBe(true)
    expect(await verifyPassword(hash, 'wrongpassword')).toBe(false)
  })
})
