import { describe, expect, it } from 'vitest'

import {
  activeInput,
  createChallengeSchema,
  updateChallengeSchema,
} from '@/features/challenges/schemas/challengeSchemas'

const base = {
  title: 'Welcome Flag',
  category: 'Misc',
  description: 'Find the hidden flag in the welcome post.',
  points: 50,
  active: 'on' as const,
}

describe('challenge schemas', () => {
  it('accepts a valid TEXT challenge', () => {
    expect(
      createChallengeSchema.safeParse({ ...base, type: 'TEXT', flag: 'ACD{hello}' }).success
    ).toBe(true)
  })

  it('rejects an invalid challenge type', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      type: 'DOCKER',
      flag: 'ACD{hello}',
    })
    expect(result.success).toBe(false)
  })

  it('requires fileUrl for FILE challenges', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      type: 'FILE',
      flag: 'ACD{hello}',
    })
    expect(result.success).toBe(false)
  })

  it('requires externalUrl for EXTERNAL challenges', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      type: 'EXTERNAL',
      flag: 'ACD{hello}',
    })
    expect(result.success).toBe(false)
  })

  it('rejects URLs on TEXT challenges', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      type: 'TEXT',
      fileUrl: 'https://example.com/file.zip',
      flag: 'ACD{hello}',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-http(s) URLs via real parsing', () => {
    const file = createChallengeSchema.safeParse({
      ...base,
      type: 'FILE',
      fileUrl: 'ftp://example.com/file.zip',
      flag: 'ACD{hello}',
    })
    expect(file.success).toBe(false)

    const external = createChallengeSchema.safeParse({
      ...base,
      type: 'EXTERNAL',
      externalUrl: 'not-a-url',
      flag: 'ACD{hello}',
    })
    expect(external.success).toBe(false)
  })

  it('treats blank edit flag as keep-current (undefined)', () => {
    const result = updateChallengeSchema.safeParse({
      ...base,
      id: '4b2873c8-01b9-4c22-9482-858276b94c43',
      type: 'TEXT',
      flag: '',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.flag).toBeUndefined()
  })

  it('parses checkbox active values explicitly', () => {
    expect(activeInput.safeParse('on').data).toBe(true)
    expect(activeInput.safeParse(null).data).toBe(false)
    expect(activeInput.safeParse('false').data).toBe(false)
    expect(activeInput.safeParse(true).data).toBe(true)
  })
})
