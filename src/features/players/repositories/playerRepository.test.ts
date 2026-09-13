import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { getPlayerById } from '@/features/players/repositories/playerRepository'

function mockTables(tables: Record<string, { data: unknown; error: null }>) {
  vi.mocked(createAdminClient).mockReturnValue({
    from: ((table: string) => {
      const result = tables[table] ?? { data: null, error: null }
      const chain: Record<string, unknown> = {}
      chain.select = vi.fn(() => chain)
      chain.eq = vi.fn(() => chain)
      chain.maybeSingle = vi.fn(() => Promise.resolve(result))
      chain.single = vi.fn(() => Promise.resolve(result))
      return chain
    }) as never,
  } as never)
}

const teamRow = { id: 'team-1', name: 'Cyber Knights', slug: 'cyber-knights' }

describe('getPlayerById with nullable teams', () => {
  it('resolves ADMIN with null team_id and team: null', async () => {
    mockTables({
      players: {
        data: {
          id: 'admin-1',
          full_name: 'Root',
          alias: 'root',
          team_id: null,
          role: 'ADMIN',
        },
        error: null,
      },
      teams: { data: null, error: null },
    })

    await expect(getPlayerById('admin-1')).resolves.toMatchObject({
      role: 'ADMIN',
      team: null,
    })
  })

  it('resolves PLAYER with a team normally', async () => {
    mockTables({
      players: {
        data: {
          id: 'player-1',
          full_name: 'Test Player',
          alias: 'tester',
          team_id: 'team-1',
          role: 'PLAYER',
        },
        error: null,
      },
      teams: { data: teamRow, error: null },
    })

    await expect(getPlayerById('player-1')).resolves.toMatchObject({
      role: 'PLAYER',
      team: teamRow,
    })
  })

  it('rejects PLAYER with null team_id as corrupt', async () => {
    mockTables({
      players: {
        data: {
          id: 'player-2',
          full_name: 'Orphan',
          alias: 'orphan',
          team_id: null,
          role: 'PLAYER',
        },
        error: null,
      },
      teams: { data: null, error: null },
    })

    await expect(getPlayerById('player-2')).rejects.toThrow()
  })
})
