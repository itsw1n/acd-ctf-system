import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/players/repositories/playerRepository', () => ({
  createPlayer: vi.fn(),
  getTeamById: vi.fn(),
  verifyRecoveryCode: vi.fn(),
}))

vi.mock('@/features/sessions/services/sessionService', () => ({
  issuePlayerSession: vi.fn(),
  getCurrentPlayer: vi.fn(),
  requireCurrentPlayer: vi.fn(),
  clearCurrentSession: vi.fn(),
}))

vi.mock('@/lib/security/hash', () => ({
  createRecoveryCode: () => 'ACD-AAAA-BBBB-CCCC',
  hashPassword: vi.fn(async () => 'hashed-password'),
  sha256: (value: string) => `sha:${value}`,
}))

import { createPlayer, getTeamById } from '@/features/players/repositories/playerRepository'
import { signUp } from '@/features/auth/services/signUp'

const validSignup = {
  teamId: '4b2873c8-01b9-4c22-9482-858276b94c43',
  fullName: 'Attacker',
  alias: 'attacker',
  password: 'securepassword123',
}

describe('poisoned signup cannot self-assign ADMIN', () => {
  beforeEach(() => vi.clearAllMocks())

  it('ignores a caller-supplied role and persists PLAYER', async () => {
    vi.mocked(getTeamById).mockResolvedValueOnce({ id: validSignup.teamId } as never)
    vi.mocked(createPlayer).mockResolvedValueOnce('player-id' as never)

    // Forced past TypeScript: simulates a hand-crafted Burp/curl body.
    const poisoned = { ...validSignup, role: 'ADMIN' } as never
    await signUp(poisoned)

    expect(vi.mocked(createPlayer)).toHaveBeenCalledTimes(1)
    const input = vi.mocked(createPlayer).mock.calls[0]?.[0] as Record<string, unknown>
    // The service never forwards a role; the repository hardcodes PLAYER.
    expect(input).not.toHaveProperty('role')
    expect(input).toMatchObject({
      fullName: 'Attacker',
      alias: 'attacker',
      teamId: validSignup.teamId,
    })
  })
})
