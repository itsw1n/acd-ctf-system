import { describe, expect, it } from 'vitest'
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/features/auth/schemas/authSchemas'

const validSignup = {
  teamId: '4b2873c8-01b9-4c22-9482-858276b94c43',
  fullName: 'Test Player',
  alias: 'testplayer',
  password: '0123456789',
  confirmPassword: '0123456789',
}

describe('signup schema', () => {
  it('accepts a valid signup', () => {
    expect(signUpSchema.safeParse(validSignup).success).toBe(true)
  })

  it('rejects passwords shorter than 10 characters', () => {
    const result = signUpSchema.safeParse({
      ...validSignup,
      password: 'short1',
      confirmPassword: 'short1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects passwords longer than 128 characters', () => {
    const long = 'a'.repeat(129)
    const result = signUpSchema.safeParse({ ...validSignup, password: long, confirmPassword: long })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched confirmation', () => {
    const result = signUpSchema.safeParse({ ...validSignup, confirmPassword: 'different12' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
    }
  })

  it('allows spaces and symbols without composition rules', () => {
    const password = 'correct horse battery staple!'
    const result = signUpSchema.safeParse({ ...validSignup, password, confirmPassword: password })
    expect(result.success).toBe(true)
  })
})

describe('signin schema', () => {
  it('accepts alias and password', () => {
    expect(signInSchema.safeParse({ alias: 'testplayer', password: 'whatever' }).success).toBe(true)
  })
})

describe('reset schema', () => {
  it('rejects mismatched new passwords', () => {
    const result = resetPasswordSchema.safeParse({
      alias: 'testplayer',
      recoveryCode: 'ACD-AAAA-BBBB-CCCC',
      newPassword: '0123456789',
      confirmPassword: 'different12',
    })
    expect(result.success).toBe(false)
  })
})
