import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { listTeamsWithStats } from '@/features/teams/queries/teamAdminQueries'

function selectResult(result: { data: unknown; error: null }) {
  // Mirrors the Supabase builder: chainable and awaitable (thenable).
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => Promise.resolve(result))
  chain.then = (resolve: (value: unknown) => unknown) => resolve(result)
  return chain
}

describe('team member counts exclude teamless ADMINs', () => {
  it('counts PLAYER members only and ignores ADMIN solves', async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => {
        if (table === 'teams') {
          return selectResult({ data: [{ id: 't1', name: 'Ops', slug: 'ops' }], error: null })
        }
        if (table === 'players') {
          return selectResult({
            data: [
              { id: 'p1', team_id: 't1', role: 'PLAYER' },
              { id: 'admin-1', team_id: null, role: 'ADMIN' },
            ],
            error: null,
          })
        }
        return selectResult({
          data: [
            { player_id: 'p1', points_awarded: 50 },
            { player_id: 'admin-1', points_awarded: 1000 },
          ],
          error: null,
        })
      }) as never,
    } as never)

    const teams = await listTeamsWithStats()

    expect(teams).toHaveLength(1)
    expect(teams[0]).toMatchObject({ memberCount: 1, score: 50 })
  })
})
