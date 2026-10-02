import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { encryptFlag } from '@/lib/security/flagCrypto'
import { getChallengeForEdit } from '@/features/challenges/repositories/challengeRepository'

const TEST_KEY = '1'.repeat(64)

function mockChallengeRow(data: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(() => Promise.resolve({ data, error: null }))
  vi.mocked(createAdminClient).mockReturnValue({
    from: (() => chain) as never,
  } as never)
}

const baseRow = {
  id: 'challenge-1',
  title: 'Welcome Flag',
  author: 'ACD Team',
  category: 'Misc',
  description: 'Start here.',
  type: 'TEXT',
  points: 50,
  external_url: null,
  active: true,
}

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

function eqCalls() {
  const calls: Array<[unknown, unknown]> = []
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn((column: unknown, value: unknown) => {
    calls.push([column, value])
    return chain
  })
  chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }))
  vi.mocked(createAdminClient).mockReturnValue({
    from: (() => chain) as never,
  } as never)
  return calls
}

describe('getChallengeForEdit with encrypted flags', () => {
  it('decrypts flag_encrypted for the admin form', async () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    mockChallengeRow({ ...baseRow, flag_encrypted: encryptFlag('ACD{demo}') })

    await expect(getChallengeForEdit('challenge-1', ROOM_ID)).resolves.toMatchObject({
      flag: 'ACD{demo}',
    })
    vi.unstubAllEnvs()
  })

  it('returns null flag when nothing is stored (seeded hashes only)', async () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    mockChallengeRow({ ...baseRow, flag_encrypted: null })

    await expect(getChallengeForEdit('challenge-1', ROOM_ID)).resolves.toMatchObject({
      flag: null,
    })
    vi.unstubAllEnvs()
  })

  it('fails closed with a safe error on tampered ciphertext', async () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    mockChallengeRow({ ...baseRow, flag_encrypted: 'v1.00.deadbeef' })

    await expect(getChallengeForEdit('challenge-1', ROOM_ID)).rejects.toThrow(
      'Unable to load challenge: stored flag cannot be decrypted'
    )
    vi.unstubAllEnvs()
  })

  it('scopes the edit read to the room', async () => {
    const calls = eqCalls()
    await getChallengeForEdit('challenge-1', ROOM_ID)
    expect(calls).toContainEqual(['id', 'challenge-1'])
    expect(calls).toContainEqual(['room_id', ROOM_ID])
  })
})
