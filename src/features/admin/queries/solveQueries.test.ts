import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/rooms/services/requireRoom', () => ({
  requireRoomOwnerById: vi.fn(async () => ({ membership: { role: 'OWNER' } })),
}))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createAdminClient } from '@/lib/supabase/admin'
import { listSolveCategoriesForAdmin, listSolvesForAdmin } from './solveQueries'

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

function result(data: unknown) {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    in: vi.fn(),
    eq: vi.fn(),
    then: (resolve: (value: unknown) => unknown) => resolve({ data, error: null }),
  }
  chain.select.mockReturnValue(chain)
  chain.order.mockReturnValue(chain)
  chain.limit.mockReturnValue(chain)
  chain.in.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  return chain
}

describe('admin solve filters', () => {
  it('keeps every solve for a team, including repeat solves by one player', async () => {
    const tables = {
      solves: result([
        {
          id: 's1',
          player_id: 'p1',
          challenge_id: 'c1',
          points_awarded: 10,
          solved_at: '2026-01-02',
        },
        {
          id: 's2',
          player_id: 'p1',
          challenge_id: 'c2',
          points_awarded: 20,
          solved_at: '2026-01-01',
        },
        {
          id: 's3',
          player_id: 'p2',
          challenge_id: 'c1',
          points_awarded: 10,
          solved_at: '2026-01-01',
        },
      ]),
      room_memberships: result([
        { player_id: 'p1', team_id: 't1', role: 'PARTICIPANT' },
        { player_id: 'p2', team_id: 't2', role: 'PARTICIPANT' },
      ]),
      players: result([
        { id: 'p1', alias: 'one', full_name: 'One' },
        { id: 'p2', alias: 'two', full_name: 'Two' },
      ]),
      challenges: result([
        { id: 'c1', title: 'First', category: 'Web' },
        { id: 'c2', title: 'Second', category: 'Crypto' },
      ]),
      teams: result([
        { id: 't1', name: 'Team One' },
        { id: 't2', name: 'Team Two' },
      ]),
    }
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: keyof typeof tables) => tables[table]) as never,
    } as never)

    const rows = await listSolvesForAdmin(ROOM_ID, { teamId: 't1' })
    expect(rows.map((row) => row.id)).toEqual(['s1', 's2'])
    expect(
      (await listSolvesForAdmin(ROOM_ID, { teamId: 't1', category: 'Crypto', search: 'Second' })).map(
        (row) => row.id
      )
    ).toEqual(['s2'])
    expect(await listSolveCategoriesForAdmin(ROOM_ID)).toEqual(['Crypto', 'Web'])
  })
})
