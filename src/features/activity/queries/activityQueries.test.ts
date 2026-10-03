import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { getPlayerActivity, getPlayerScore } from '@/features/activity/queries/activityQueries'

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

function scoped(result: { data: unknown; error: null }) {
  const chain: Record<string, unknown> = {}
  const eqCalls: Array<[unknown, unknown]> = []
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn((column: unknown, value: unknown) => {
    eqCalls.push([column, value])
    return chain
  })
  chain.order = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.then = (resolve: (value: unknown) => unknown) => resolve(result)
  return { chain, eqCalls }
}

describe('activity and score room scoping', () => {
  it('filters solves and challenges by room', async () => {
    const solves = scoped({
      data: [
        {
          id: 's1',
          solved_at: '2026-01-01T10:00:00.000Z',
          points_awarded: 50,
          challenge_id: 'c1',
        },
      ],
      error: null,
    })
    const challenges = scoped({
      data: [{ id: 'c1', title: 'First', category: 'Web' }],
      error: null,
    })
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => (table === 'solves' ? solves.chain : challenges.chain)) as never,
    } as never)

    await getPlayerActivity('player-1', ROOM_ID)

    expect(solves.eqCalls).toContainEqual(['player_id', 'player-1'])
    expect(solves.eqCalls).toContainEqual(['room_id', ROOM_ID])
    expect(challenges.eqCalls).toContainEqual(['room_id', ROOM_ID])
  })

  it('scores only the room', async () => {
    const solves = scoped({
      data: [{ points_awarded: 50 }, { points_awarded: 100 }],
      error: null,
    })
    vi.mocked(createAdminClient).mockReturnValue({
      from: (() => solves.chain) as never,
    } as never)

    await expect(getPlayerScore('player-1', ROOM_ID)).resolves.toBe(150)
    expect(solves.eqCalls).toContainEqual(['player_id', 'player-1'])
    expect(solves.eqCalls).toContainEqual(['room_id', ROOM_ID])
  })
})
