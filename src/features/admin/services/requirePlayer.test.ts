import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/sessions/services/sessionService', () => ({
  getCurrentPlayer: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
  forbidden: () => {
    throw new Error('FORBIDDEN')
  },
}))

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'
import { requirePlayer } from '@/features/admin/services/requirePlayer'
import type { Player } from '@/features/players/types'

function playerWith(role: 'PLAYER' | 'ADMIN'): Player {
  return {
    id: 'player-id',
    fullName: 'Test User',
    alias: 'tester',
    role,
    team: role === 'PLAYER' ? { id: 'team-id', name: 'Ops', slug: 'ops' } : null,
  } as Player
}

describe('requirePlayer', () => {
  it('redirects unauthenticated callers to /signin', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(requirePlayer()).rejects.toThrow('REDIRECT:/signin')
  })

  it('redirects ADMIN accounts to /admin', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(playerWith('ADMIN'))
    await expect(requirePlayer()).rejects.toThrow('REDIRECT:/admin')
  })

  it('allows PLAYER accounts', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(playerWith('PLAYER'))
    await expect(requirePlayer()).resolves.toMatchObject({ role: 'PLAYER' })
  })
})
