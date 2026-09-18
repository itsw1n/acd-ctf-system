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
  category: 'Misc',
  description: 'Start here.',
  type: 'TEXT',
  points: 50,
  external_url: null,
  file_url: null,
  active: true,
}

describe('getChallengeForEdit with encrypted flags', () => {
  it('decrypts flag_encrypted for the admin form', async () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    mockChallengeRow({ ...baseRow, flag_encrypted: encryptFlag('ACD{demo}') })

    await expect(getChallengeForEdit('challenge-1')).resolves.toMatchObject({
      flag: 'ACD{demo}',
    })
    vi.unstubAllEnvs()
  })

  it('returns null flag when nothing is stored (seeded hashes only)', async () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    mockChallengeRow({ ...baseRow, flag_encrypted: null })

    await expect(getChallengeForEdit('challenge-1')).resolves.toMatchObject({
      flag: null,
    })
    vi.unstubAllEnvs()
  })

  it('fails closed with a safe error on tampered ciphertext', async () => {
    vi.stubEnv('FLAG_ENCRYPTION_KEY', TEST_KEY)
    mockChallengeRow({ ...baseRow, flag_encrypted: 'v1.00.deadbeef' })

    await expect(getChallengeForEdit('challenge-1')).rejects.toThrow(
      'Unable to load challenge: stored flag cannot be decrypted'
    )
    vi.unstubAllEnvs()
  })
})
