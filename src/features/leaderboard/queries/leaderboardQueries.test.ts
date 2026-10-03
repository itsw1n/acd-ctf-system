import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { getLeaderboards } from '@/features/leaderboard/queries/leaderboardQueries'

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

function mockTables(tables: Record<string, unknown>) {
  vi.mocked(createAdminClient).mockReturnValue({
    from: ((table: string) => tables[table]) as never,
  } as never)
}

function selected(result: { data: unknown; error: null }) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.then = (resolve: (value: unknown) => unknown) => resolve(result)
  return chain
}

describe('leaderboard excludes teamless owners', () => {
  it('omits owners from player ranks and team scores', async () => {
    mockTables({
      teams: selected({ data: [{ id: 't1', name: 'Cyber Knights' }], error: null }),
      room_memberships: selected({
        data: [
          { player_id: 'p1', team_id: 't1', role: 'PARTICIPANT' },
          { player_id: 'p2', team_id: 't1', role: 'PARTICIPANT' },
          { player_id: 'owner-1', team_id: null, role: 'OWNER' },
        ],
        error: null,
      }),
      players: selected({
        data: [
          { id: 'p1', alias: 'sean' },
          { id: 'p2', alias: 'dan' },
        ],
        error: null,
      }),
      solves: selected({
        data: [
          { player_id: 'p1', points_awarded: 50, solved_at: '2026-01-01T10:00:00.000Z' },
          { player_id: 'owner-1', points_awarded: 1000, solved_at: '2026-01-01T11:00:00.000Z' },
        ],
        error: null,
      }),
    })

    const { playerRanks, teamRanks } = await getLeaderboards(ROOM_ID)

    expect(playerRanks.map((rank) => rank.alias).sort()).toEqual(['dan', 'sean'])
    // The owner solve references a non-competitor and must not leak in.
    expect(teamRanks).toHaveLength(1)
    expect(teamRanks[0]).toMatchObject({ team: 'Cyber Knights', points: 50 })
  })

  it('does not use aliases to break an exact points and time tie', async () => {
    mockTables({
      teams: selected({ data: [{ id: 't1', name: 'Team' }], error: null }),
      room_memberships: selected({
        data: [
          { player_id: 'p1', team_id: 't1', role: 'PARTICIPANT' },
          { player_id: 'p2', team_id: 't1', role: 'PARTICIPANT' },
        ],
        error: null,
      }),
      players: selected({
        data: [
          { id: 'p1', alias: 'zulu' },
          { id: 'p2', alias: 'alpha' },
        ],
        error: null,
      }),
      solves: selected({
        data: [
          { player_id: 'p1', points_awarded: 1500, solved_at: '2026-01-01T10:00:00.000Z' },
          { player_id: 'p2', points_awarded: 1500, solved_at: '2026-01-01T10:00:00.000Z' },
        ],
        error: null,
      }),
    })

    const { playerRanks } = await getLeaderboards(ROOM_ID)
    expect(playerRanks.map((rank) => rank.alias)).toEqual(['zulu', 'alpha'])
  })
})
