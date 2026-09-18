import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/players/repositories/playerRepository', () => ({
  getPlayerByAlias: vi.fn(),
  updatePlayerPassword: vi.fn(),
  verifyRecoveryCode: vi.fn(),
}))

vi.mock('@/features/sessions/repositories/sessionRepository', () => ({
  deleteAllSessionsForPlayer: vi.fn(),
}))

vi.mock('@/lib/security/hash', () => ({
  hashPassword: vi.fn(async () => 'new-hash'),
  sha256: (value: string) => `sha:${value}`,
}))

import {
  getPlayerByAlias,
  updatePlayerPassword,
  verifyRecoveryCode,
} from '@/features/players/repositories/playerRepository'
import { deleteAllSessionsForPlayer } from '@/features/sessions/repositories/sessionRepository'
import { resetPassword } from '@/features/auth/services/resetPassword'

const input = {
  alias: 'tester',
  recoveryCode: 'ACD-AAAA-BBBB-CCCC',
  newPassword: 'brand-new-password',
}

describe('resetPassword', () => {
  beforeEach(() => vi.clearAllMocks())

  it('revokes all sessions after a successful reset', async () => {
    vi.mocked(getPlayerByAlias).mockResolvedValueOnce({
      id: 'player-1',
      alias: 'tester',
    } as never)
    vi.mocked(verifyRecoveryCode).mockResolvedValueOnce(true)

    await resetPassword(input)

    expect(vi.mocked(updatePlayerPassword)).toHaveBeenCalledWith('player-1', 'new-hash')
    expect(vi.mocked(deleteAllSessionsForPlayer)).toHaveBeenCalledWith('player-1')
  })

  it('rejects unknown aliases through the same verification path', async () => {
    vi.mocked(getPlayerByAlias).mockResolvedValueOnce(null)

    await expect(resetPassword(input)).rejects.toThrow('INVALID_RECOVERY')
    // The hash comparison still runs against a nil UUID so unknown aliases
    // cost the same work and reveal nothing.
    expect(vi.mocked(verifyRecoveryCode)).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000',
      expect.any(String)
    )
    expect(vi.mocked(deleteAllSessionsForPlayer)).not.toHaveBeenCalled()
  })

  it('rejects wrong recovery codes without touching sessions', async () => {
    vi.mocked(getPlayerByAlias).mockResolvedValueOnce({
      id: 'player-1',
      alias: 'tester',
    } as never)
    vi.mocked(verifyRecoveryCode).mockResolvedValueOnce(false)

    await expect(resetPassword(input)).rejects.toThrow('INVALID_RECOVERY')
    expect(vi.mocked(updatePlayerPassword)).not.toHaveBeenCalled()
    expect(vi.mocked(deleteAllSessionsForPlayer)).not.toHaveBeenCalled()
  })
})
