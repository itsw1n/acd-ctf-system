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
import { requireAdmin } from '@/features/admin/services/requireAdmin'
import type { Player } from '@/features/players/types'

function adminPlayer(): Player {
  return {
    id: 'admin-id',
    fullName: 'Admin User',
    alias: 'admin',
    role: 'ADMIN',
    team: { id: 'team-id', name: 'Ops', slug: 'ops' },
  }
}

function regularPlayer() {
  return {
    id: 'player-id',
    fullName: 'Regular Player',
    alias: 'player',
    role: 'PLAYER',
    team: { id: 'team-id', name: 'Ops', slug: 'ops' },
  } as never
}

describe('requireAdmin', () => {
  it('redirects unauthenticated callers to /signin', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/signin')
  })

  it('denies authenticated non-admin players', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(regularPlayer())
    await expect(requireAdmin()).rejects.toThrow('FORBIDDEN')
  })

  it('allows admins', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(adminPlayer())
    await expect(requireAdmin()).resolves.toMatchObject({ role: 'ADMIN' })
  })

  it('allows teamless ADMIN accounts', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce({ ...adminPlayer(), team: null } as never)
    await expect(requireAdmin()).resolves.toMatchObject({ role: 'ADMIN', team: null })
  })
})
