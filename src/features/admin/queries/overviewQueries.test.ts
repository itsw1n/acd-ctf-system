import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/features/rooms/services/requireRoom', () => ({
  requireRoomOwnerById: vi.fn(async () => ({ membership: { role: 'OWNER' } })),
}))

vi.mock('@/features/leaderboard/queries/leaderboardQueries', () => ({
  getLeaderboards: vi.fn(async () => ({ playerRanks: [], teamRanks: [] })),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { getLeaderboards } from '@/features/leaderboard/queries/leaderboardQueries'
import { getAdminOverview } from '@/features/admin/queries/overviewQueries'

function counted(count: number) {
  const chain: Record<string, unknown> = {}
  const eqCalls: Array<[unknown, unknown]> = []
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn((column: unknown, value: unknown) => {
    eqCalls.push([column, value])
    return chain
  })
  chain.then = (resolve: (value: unknown) => unknown) => resolve({ count, error: null, data: null })
  return { chain, eqCalls }
}

describe('getAdminOverview room scoping', () => {
  it('counts members, teams, challenges, and solves in the room', async () => {
    const tables = {
      room_memberships: counted(3),
      teams: counted(2),
      challenges: counted(5),
      solves: counted(7),
    }
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: keyof typeof tables) => tables[table].chain) as never,
    } as never)

    const overview = await getAdminOverview('22222222-2222-4222-8222-222222222222')

    expect(overview).toMatchObject({
      totalPlayers: 3,
      totalTeams: 2,
      activeChallenges: 5,
      totalSolves: 7,
    })
    for (const table of Object.values(tables)) {
      expect(table.eqCalls).toContainEqual(['room_id', '22222222-2222-4222-8222-222222222222'])
    }
    expect(vi.mocked(getLeaderboards)).toHaveBeenCalledWith('22222222-2222-4222-8222-222222222222')
  })
})
