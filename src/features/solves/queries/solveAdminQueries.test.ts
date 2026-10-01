import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/admin/services/requireAdmin', () => ({
  requireAdmin: vi.fn(async () => ({ role: 'ADMIN' })),
}))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createAdminClient } from '@/lib/supabase/admin'
import { listSolveCategoriesForAdmin, listSolvesForAdmin } from './solveAdminQueries'

function result(data: unknown) {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    in: vi.fn(),
    then: (resolve: (value: unknown) => unknown) => resolve({ data, error: null }),
  }
  chain.select.mockReturnValue(chain)
  chain.order.mockReturnValue(chain)
  chain.limit.mockReturnValue(chain)
  chain.in.mockReturnValue(chain)
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
      players: result([
        { id: 'p1', alias: 'one', full_name: 'One', team_id: 't1' },
        { id: 'p2', alias: 'two', full_name: 'Two', team_id: 't2' },
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

    const rows = await listSolvesForAdmin({ teamId: 't1' })
    expect(rows.map((row) => row.id)).toEqual(['s1', 's2'])
    expect(
      (await listSolvesForAdmin({ teamId: 't1', category: 'Crypto', search: 'Second' })).map(
        (row) => row.id
      )
    ).toEqual(['s2'])
    expect(await listSolveCategoriesForAdmin()).toEqual(['Crypto', 'Web'])
  })
})
