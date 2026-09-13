import { describe, expect, it } from 'vitest'
import { createRecoveryCode, sha256 } from './hash'

describe('security hashing', () => {
  it('returns a deterministic SHA-256 digest', () => {
    expect(sha256('ACD{test}')).toBe(sha256('ACD{test}'))
    expect(sha256('ACD{test}')).not.toBe(sha256('ACD{other}'))
  })

  it('creates a grouped recovery code', () => {
    expect(createRecoveryCode()).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
  })
})
