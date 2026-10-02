import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/features/rooms/services/requireRoom', () => ({
  requireRoomOwnerById: vi.fn(async () => ({ membership: { role: 'OWNER' } })),
}))

vi.mock('@/features/rooms/repositories/roomRepository', () => ({
  getDefaultRoom: vi.fn(async () => ({ id: '22222222-2222-4222-8222-222222222222' })),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { listTeamsWithStats } from '@/features/teams/queries/teamAdminQueries'

function selectResult(result: { data: unknown; error: null }) {
  // Mirrors the Supabase builder: chainable and awaitable (thenable).
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => Promise.resolve(result))
  chain.then = (resolve: (value: unknown) => unknown) => resolve(result)
  return chain
}

describe('team member counts exclude teamless owners', () => {
  it('counts PARTICIPANT members only and ignores owner solves', async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => {
        if (table === 'teams') {
          return selectResult({ data: [{ id: 't1', name: 'Ops', slug: 'ops' }], error: null })
        }
        if (table === 'room_memberships') {
          return selectResult({
            data: [
              { player_id: 'p1', team_id: 't1', role: 'PARTICIPANT' },
              { player_id: 'owner-1', team_id: null, role: 'OWNER' },
            ],
            error: null,
          })
        }
        return selectResult({
          data: [
            { player_id: 'p1', points_awarded: 50 },
            { player_id: 'owner-1', points_awarded: 1000 },
          ],
          error: null,
        })
      }) as never,
    } as never)

    const teams = await listTeamsWithStats('22222222-2222-4222-8222-222222222222')

    expect(teams).toHaveLength(1)
    expect(teams[0]).toMatchObject({ memberCount: 1, score: 50 })
  })
})
