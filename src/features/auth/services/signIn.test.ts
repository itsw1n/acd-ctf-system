import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/players/repositories/playerRepository', () => ({
  getPlayerCredentialsByAlias: vi.fn(),
}))

vi.mock('@/features/sessions/services/sessionService', () => ({
  issuePlayerSession: vi.fn(),
}))

vi.mock('@/lib/security/hash', () => ({
  verifyPassword: vi.fn(),
}))

import { getPlayerCredentialsByAlias } from '@/features/players/repositories/playerRepository'
import { issuePlayerSession } from '@/features/sessions/services/sessionService'
import { verifyPassword } from '@/lib/security/hash'
import { signIn } from '@/features/auth/services/signIn'

function credentials(overrides: Record<string, unknown> = {}) {
  return {
    id: 'player-1',
    alias: 'tester',
    password_hash: 'stored-hash',
    role: 'PLAYER',
    ...overrides,
  } as never
}

describe('signIn', () => {
  beforeEach(() => vi.clearAllMocks())

  it('issues a session and returns the role on valid credentials', async () => {
    vi.mocked(getPlayerCredentialsByAlias).mockResolvedValueOnce(credentials())
    vi.mocked(verifyPassword).mockResolvedValueOnce(true)

    await expect(signIn({ alias: 'tester', password: 'correct-password' })).resolves.toBe('PLAYER')
    expect(vi.mocked(issuePlayerSession)).toHaveBeenCalledWith('player-1')
  })

  it('returns ADMIN for admin credentials so callers can route to /admin', async () => {
    vi.mocked(getPlayerCredentialsByAlias).mockResolvedValueOnce(
      credentials({ id: 'admin-1', alias: 'root', role: 'ADMIN' })
    )
    vi.mocked(verifyPassword).mockResolvedValueOnce(true)

    await expect(signIn({ alias: 'root', password: 'correct-password' })).resolves.toBe('ADMIN')
  })

  it('rejects wrong passwords without issuing a session', async () => {
    vi.mocked(getPlayerCredentialsByAlias).mockResolvedValueOnce(credentials())
    vi.mocked(verifyPassword).mockResolvedValueOnce(false)

    await expect(signIn({ alias: 'tester', password: 'wrong-password' })).rejects.toThrow(
      'INVALID_CREDENTIALS'
    )
    expect(vi.mocked(issuePlayerSession)).not.toHaveBeenCalled()
  })

  it('rejects unknown aliases with the same public error', async () => {
    vi.mocked(getPlayerCredentialsByAlias).mockResolvedValueOnce(null)
    vi.mocked(verifyPassword).mockResolvedValueOnce(true)

    await expect(signIn({ alias: 'ghost', password: 'any-password' })).rejects.toThrow(
      'INVALID_CREDENTIALS'
    )
    expect(vi.mocked(issuePlayerSession)).not.toHaveBeenCalled()
  })
})
