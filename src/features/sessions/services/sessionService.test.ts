import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/config/env', () => ({
  env: { SESSION_COOKIE_NAME: 'test_session_cookie' },
}))

vi.mock('@/features/sessions/repositories/sessionRepository', () => ({
  createSessionRecord: vi.fn(),
  deleteAllSessionsForPlayer: vi.fn(),
  deleteSessionByTokenHash: vi.fn(),
  getSessionPlayerId: vi.fn(),
}))

vi.mock('@/features/players/repositories/playerRepository', () => ({
  getPlayerById: vi.fn(),
}))

import { cookies } from 'next/headers'
import {
  deleteSessionByTokenHash,
  getSessionPlayerId,
} from '@/features/sessions/repositories/sessionRepository'
import { getPlayerById } from '@/features/players/repositories/playerRepository'
import { clearCurrentSession, getCurrentPlayer } from '@/features/sessions/services/sessionService'

function cookieWith(token: string | undefined) {
  vi.mocked(cookies).mockResolvedValueOnce({
    get: () => (token === undefined ? undefined : { value: token }),
  } as never)
}

function dbPlayer(role: 'PLAYER' | 'ADMIN') {
  return {
    id: 'player-1',
    fullName: 'Test User',
    alias: 'tester',
    role,
    team: { id: 't1', name: 'Ops', slug: 'ops' },
  } as never
}

describe('session role resolution', () => {
  beforeEach(() => vi.clearAllMocks())

  it('takes role from the player database row, not the cookie', async () => {
    cookieWith('opaque-client-token')
    vi.mocked(getSessionPlayerId).mockResolvedValueOnce('player-1')
    vi.mocked(getPlayerById).mockResolvedValueOnce(dbPlayer('ADMIN'))

    const player = await getCurrentPlayer()

    // The raw cookie value only locates the session; it carries no role.
    expect(vi.mocked(getSessionPlayerId)).toHaveBeenCalledWith(expect.not.stringContaining('ADMIN'))
    expect(player).toMatchObject({ id: 'player-1', role: 'ADMIN' })
  })

  it('resolves PLAYER for the same cookie shape when the row says PLAYER', async () => {
    cookieWith('opaque-client-token')
    vi.mocked(getSessionPlayerId).mockResolvedValueOnce('player-1')
    vi.mocked(getPlayerById).mockResolvedValueOnce(dbPlayer('PLAYER'))

    const player = await getCurrentPlayer()

    expect(player).toMatchObject({ role: 'PLAYER' })
  })

  it('returns null without a cookie', async () => {
    cookieWith(undefined)

    await expect(getCurrentPlayer()).resolves.toBeNull()
    expect(vi.mocked(getSessionPlayerId)).not.toHaveBeenCalled()
  })

  it('rejects unknown, expired, and revoked session tokens', async () => {
    cookieWith('stale-or-forged-token')
    vi.mocked(getSessionPlayerId).mockResolvedValueOnce(null)

    await expect(getCurrentPlayer()).resolves.toBeNull()
    expect(vi.mocked(getPlayerById)).not.toHaveBeenCalled()
  })

  it('rejects sessions whose account no longer exists', async () => {
    cookieWith('orphaned-token')
    vi.mocked(getSessionPlayerId).mockResolvedValueOnce('deleted-player')
    vi.mocked(getPlayerById).mockResolvedValueOnce(null)

    await expect(getCurrentPlayer()).resolves.toBeNull()
  })

  it('stays valid across repeated validations while cookie and row persist', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: 'persistent-token' }),
    } as never)
    vi.mocked(getSessionPlayerId).mockResolvedValue('player-1')
    vi.mocked(getPlayerById).mockResolvedValue(dbPlayer('PLAYER'))

    await expect(getCurrentPlayer()).resolves.toMatchObject({ id: 'player-1' })
    await expect(getCurrentPlayer()).resolves.toMatchObject({ id: 'player-1' })
    expect(vi.mocked(getSessionPlayerId)).toHaveBeenCalledTimes(2)
  })
})

describe('logout invalidates the server session', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes the session row and the cookie', async () => {
    const storeDelete = vi.fn()
    vi.mocked(cookies).mockResolvedValueOnce({
      get: () => ({ value: 'logout-token' }),
      delete: storeDelete,
    } as never)

    await clearCurrentSession()

    expect(vi.mocked(deleteSessionByTokenHash)).toHaveBeenCalledTimes(1)
    expect(storeDelete).toHaveBeenCalledWith('test_session_cookie')
  })

  it('still clears the cookie when no session is presented', async () => {
    const storeDelete = vi.fn()
    vi.mocked(cookies).mockResolvedValueOnce({
      get: () => undefined,
      delete: storeDelete,
    } as never)

    await clearCurrentSession()

    expect(vi.mocked(deleteSessionByTokenHash)).not.toHaveBeenCalled()
    expect(storeDelete).toHaveBeenCalledWith('test_session_cookie')
  })
})
