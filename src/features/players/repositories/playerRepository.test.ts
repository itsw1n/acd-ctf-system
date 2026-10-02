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

describe('getPlayerById returns bare accounts', () => {
  it('resolves id, name, and alias without team or role', async () => {
    mockTables({
      players: {
        data: {
          id: 'player-1',
          full_name: 'Test Player',
          alias: 'tester',
        },
        error: null,
      },
    })

    await expect(getPlayerById('player-1')).resolves.toMatchObject({
      id: 'player-1',
      fullName: 'Test Player',
      alias: 'tester',
    })
  })

  it('returns null for unknown players', async () => {
    mockTables({ players: { data: null, error: null } })

    await expect(getPlayerById('nobody')).resolves.toBeNull()
  })
})
