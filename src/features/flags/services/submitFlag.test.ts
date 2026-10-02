import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/flags/repositories/flagRepository', () => ({
  createSolve: vi.fn(),
  findChallengeByFlagHash: vi.fn(),
}))

import { createSolve, findChallengeByFlagHash } from '@/features/flags/repositories/flagRepository'
import { submitFlagForPlayer } from '@/features/flags/services/submitFlag'

const ROOM_ID = '22222222-2222-4222-8222-222222222222'
const PLAYER_ID = '11111111-1111-4111-8111-111111111111'

describe('submitFlagForPlayer room scoping', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves the challenge within the room and records a room-scoped solve', async () => {
    vi.mocked(findChallengeByFlagHash).mockResolvedValueOnce({
      id: 'challenge-1',
      title: 'Welcome Flag',
      points: 50,
    } as never)
    vi.mocked(createSolve).mockResolvedValueOnce({ created: true as const })

    const result = await submitFlagForPlayer(PLAYER_ID, ROOM_ID, 'ACD{welcome_to_ctf}')

    expect(result).toMatchObject({ status: 'correct', points: 50 })
    expect(vi.mocked(findChallengeByFlagHash)).toHaveBeenCalledWith(expect.any(String), ROOM_ID)
    expect(vi.mocked(createSolve)).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: PLAYER_ID,
        challengeId: 'challenge-1',
        roomId: ROOM_ID,
      })
    )
  })

  it('rejects flags from other rooms as incorrect', async () => {
    vi.mocked(findChallengeByFlagHash).mockResolvedValueOnce(null)

    const result = await submitFlagForPlayer(PLAYER_ID, ROOM_ID, 'ACD{other_room_flag}')

    expect(result).toMatchObject({ status: 'incorrect' })
    expect(vi.mocked(createSolve)).not.toHaveBeenCalled()
  })
})
