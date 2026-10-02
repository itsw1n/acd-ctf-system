import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { listChallengesForPlayer } from '@/features/challenges/queries/challengePlayerQueries'

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

function queryResult(result: { data: unknown; error: null }) {
  const chain: Record<string, unknown> = {}
  const eqCalls: Array<[unknown, unknown]> = []
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn((column: unknown, value: unknown) => {
    eqCalls.push([column, value])
    return chain
  })
  chain.order = vi.fn(() => chain)
  chain.then = (resolve: (value: unknown) => unknown) => resolve(result)
  return { chain, eqCalls }
}

describe('listChallengesForPlayer room scoping', () => {
  it('filters challenges and solves by room', async () => {
    const challenges = queryResult({ data: [], error: null })
    const solves = queryResult({ data: [], error: null })
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => (table === 'challenges' ? challenges.chain : solves.chain)) as never,
    } as never)

    await listChallengesForPlayer('player-1', ROOM_ID)

    expect(challenges.eqCalls).toContainEqual(['room_id', ROOM_ID])
    expect(challenges.eqCalls).toContainEqual(['active', true])
    expect(solves.eqCalls).toContainEqual(['player_id', 'player-1'])
    expect(solves.eqCalls).toContainEqual(['room_id', ROOM_ID])
  })
})
