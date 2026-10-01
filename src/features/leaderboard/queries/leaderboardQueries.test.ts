import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { getLeaderboards } from '@/features/leaderboard/queries/leaderboardQueries'

describe('leaderboard excludes teamless ADMINs', () => {
  it('omits ADMIN from player ranks and team scores', async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => {
        if (table === 'teams') {
          return {
            select: () =>
              Promise.resolve({ data: [{ id: 't1', name: 'Cyber Knights' }], error: null }),
          }
        }
        if (table === 'players') {
          const chain: Record<string, unknown> = {}
          chain.select = vi.fn(() => chain)
          // Only PLAYER rows come back when filtered by role.
          chain.eq = vi.fn(() =>
            Promise.resolve({
              data: [
                { id: 'p1', alias: 'sean', team_id: 't1', role: 'PLAYER' },
                { id: 'p2', alias: 'dan', team_id: 't1', role: 'PLAYER' },
              ],
              error: null,
            })
          )
          return chain
        }
        return {
          select: () =>
            Promise.resolve({
              data: [
                { player_id: 'p1', points_awarded: 50, solved_at: '2026-01-01T10:00:00.000Z' },
                {
                  player_id: 'admin-1',
                  points_awarded: 1000,
                  solved_at: '2026-01-01T11:00:00.000Z',
                },
              ],
              error: null,
            }),
        }
      }) as never,
    } as never)

    const { playerRanks, teamRanks } = await getLeaderboards()

    expect(playerRanks.map((rank) => rank.alias).sort()).toEqual(['dan', 'sean'])
    // The ADMIN solve references an unknown player_id and must not leak in.
    expect(teamRanks).toHaveLength(1)
    expect(teamRanks[0]).toMatchObject({ team: 'Cyber Knights', points: 50 })
  })

  it('does not use aliases to break an exact points and time tie', async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => {
        if (table === 'teams') {
          return {
            select: () => Promise.resolve({ data: [{ id: 't1', name: 'Team' }], error: null }),
          }
        }
        if (table === 'players') {
          const chain: Record<string, unknown> = {}
          chain.select = vi.fn(() => chain)
          chain.eq = vi.fn(() =>
            Promise.resolve({
              data: [
                { id: 'p1', alias: 'zulu', team_id: 't1', role: 'PLAYER' },
                { id: 'p2', alias: 'alpha', team_id: 't1', role: 'PLAYER' },
              ],
              error: null,
            })
          )
          return chain
        }
        return {
          select: () =>
            Promise.resolve({
              data: [
                { player_id: 'p1', points_awarded: 1500, solved_at: '2026-01-01T10:00:00.000Z' },
                { player_id: 'p2', points_awarded: 1500, solved_at: '2026-01-01T10:00:00.000Z' },
              ],
              error: null,
            }),
        }
      }) as never,
    } as never)

    const { playerRanks } = await getLeaderboards()
    expect(playerRanks.map((rank) => rank.alias)).toEqual(['zulu', 'alpha'])
  })
})
