import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/challenges/repositories/challengeRepository', () => ({
  getChallengeFlagHash: vi.fn(),
  insertChallenge: vi.fn(),
  updateChallengeRow: vi.fn(),
}))

vi.mock('@/lib/security/hash', () => ({
  sha256: () => 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
}))

import {
  getChallengeFlagHash,
  insertChallenge,
  updateChallengeRow,
} from '@/features/challenges/repositories/challengeRepository'
import {
  createChallenge,
  hashFlag,
  updateChallenge,
} from '@/features/challenges/services/challengeService'

const base = {
  title: 'Welcome Flag',
  category: 'Misc',
  description: 'Find the hidden flag in the welcome post.',
  type: 'TEXT' as const,
  points: 50,
  active: true,
}

describe('challenge flag handling', () => {
  it('hashes the trimmed flag on creation and never persists plaintext', async () => {
    vi.mocked(insertChallenge).mockResolvedValueOnce('challenge-id')
    await createChallenge({ ...base, flag: '  ACD{hello}  ' })

    expect(hashFlag('  ACD{hello}  ')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
    expect(vi.mocked(insertChallenge)).toHaveBeenCalledWith(
      expect.objectContaining({
        flagHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      })
    )
    const payload = vi.mocked(insertChallenge).mock.calls[0]?.[0] as Record<string, unknown>
    expect(payload).not.toHaveProperty('flag')
    expect(JSON.stringify(payload)).not.toContain('ACD{hello}')
  })

  it('keeps the existing hash when the edit flag is blank', async () => {
    vi.mocked(getChallengeFlagHash).mockResolvedValueOnce('existing-hash')
    vi.mocked(updateChallengeRow).mockResolvedValueOnce(undefined as never)

    await updateChallenge({
      ...base,
      id: '4b2873c8-01b9-4c22-9482-858276b94c43',
      flag: undefined,
    })

    expect(vi.mocked(updateChallengeRow)).toHaveBeenCalledWith(
      '4b2873c8-01b9-4c22-9482-858276b94c43',
      expect.not.objectContaining({ flagHash: expect.anything() })
    )
  })

  it('replaces the hash when a new flag is provided', async () => {
    vi.mocked(getChallengeFlagHash).mockResolvedValueOnce('existing-hash')
    vi.mocked(updateChallengeRow).mockResolvedValueOnce(undefined as never)

    await updateChallenge({
      ...base,
      id: '4b2873c8-01b9-4c22-9482-858276b94c43',
      flag: 'ACD{new}',
    })

    expect(vi.mocked(updateChallengeRow)).toHaveBeenCalledWith(
      '4b2873c8-01b9-4c22-9482-858276b94c43',
      expect.objectContaining({
        flagHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      })
    )
  })
})
