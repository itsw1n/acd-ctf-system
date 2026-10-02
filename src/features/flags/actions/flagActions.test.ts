import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/sessions/services/sessionService', () => ({
  requireCurrentPlayer: vi.fn(),
}))

vi.mock('@/features/rooms/repositories/roomRepository', () => ({
  getDefaultRoom: vi.fn(),
  getMembership: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/features/flags/services/submitFlag', () => ({
  submitFlagForPlayer: vi.fn(),
}))

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'
import { getDefaultRoom, getMembership } from '@/features/rooms/repositories/roomRepository'
import { submitFlagForPlayer } from '@/features/flags/services/submitFlag'
import { submitFlagAction } from '@/features/flags/actions/flagActions'

function playerForm() {
  const form = new FormData()
  form.set('flag', 'ACD{welcome_to_ctf}')
  return form
}

function playerWith(role: 'PLAYER' | 'ADMIN') {
  return {
    id: role === 'PLAYER' ? 'player-1' : 'admin-1',
    fullName: role === 'PLAYER' ? 'Test Player' : 'Root',
    alias: role === 'PLAYER' ? 'tester' : 'root',
    role,
    team: role === 'PLAYER' ? { id: 't1', name: 'Ops', slug: 'ops' } : null,
  } as never
}

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

describe('flag submission role lockout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDefaultRoom).mockResolvedValue({ id: ROOM_ID } as never)
  })

  it('lets PARTICIPANT submit a valid flag in their room', async () => {
    vi.mocked(requireCurrentPlayer).mockResolvedValueOnce(playerWith('PLAYER'))
    vi.mocked(getMembership).mockResolvedValueOnce({ role: 'PARTICIPANT' } as never)
    vi.mocked(submitFlagForPlayer).mockResolvedValueOnce({
      status: 'correct',
      challenge: 'Welcome Flag',
      points: 50,
    })

    const state = await submitFlagAction({}, playerForm())

    expect(state.status).toBe('correct')
    expect(vi.mocked(submitFlagForPlayer)).toHaveBeenCalledWith(
      'player-1',
      ROOM_ID,
      'ACD{welcome_to_ctf}'
    )
  })

  it('blocks room owners without creating a solve', async () => {
    vi.mocked(requireCurrentPlayer).mockResolvedValueOnce(playerWith('PLAYER'))
    vi.mocked(getMembership).mockResolvedValueOnce({ role: 'OWNER' } as never)

    const state = await submitFlagAction({}, playerForm())

    expect(state.status).toBe('error')
    expect(vi.mocked(submitFlagForPlayer)).not.toHaveBeenCalled()
  })

  it('blocks non-members without creating a solve', async () => {
    vi.mocked(requireCurrentPlayer).mockResolvedValueOnce(playerWith('PLAYER'))
    vi.mocked(getMembership).mockResolvedValueOnce(null)

    const state = await submitFlagAction({}, playerForm())

    expect(state.status).toBe('error')
    expect(vi.mocked(submitFlagForPlayer)).not.toHaveBeenCalled()
  })
})
