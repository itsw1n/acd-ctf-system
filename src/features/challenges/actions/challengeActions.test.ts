import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/rooms/services/requireRoom', () => ({
  requireRoomOwnerById: vi.fn(),
}))

vi.mock('@/features/rooms/repositories/roomRepository', () => ({
  getDefaultRoom: vi.fn(),
}))

vi.mock('@/features/challenges/services/challengeService', () => ({
  createChallenge: vi.fn(),
  updateChallenge: vi.fn(),
}))

vi.mock('@/features/challenges/repositories/challengeRepository', () => ({
  setChallengeActive: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { getDefaultRoom } from '@/features/rooms/repositories/roomRepository'
import { createChallenge, updateChallenge } from '@/features/challenges/services/challengeService'
import { setChallengeActive } from '@/features/challenges/repositories/challengeRepository'
import {
  createChallengeAction,
  toggleChallengeActiveAction,
  updateChallengeAction,
} from '@/features/challenges/actions/challengeActions'

function formData(entries: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(entries)) form.set(key, value)
  return form
}

const validForm = () =>
  formData({
    title: 'Welcome Flag',
    author: 'ACD Team',
    category: 'Misc',
    description: 'Find the hidden flag in the welcome post.',
    type: 'TEXT',
    difficulty: 'MEDIUM',
    points: '50',
    flag: 'ACD{hello}',
    active: 'on',
  })

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

describe('admin challenge actions authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDefaultRoom).mockResolvedValue({ id: ROOM_ID } as never)
  })

  it('denies unauthenticated callers', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('REDIRECT:/signin'))
    await expect(createChallengeAction({}, validForm())).rejects.toThrow('REDIRECT:/signin')
    expect(vi.mocked(createChallenge)).not.toHaveBeenCalled()
  })

  it('denies non-owner players', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(createChallengeAction({}, validForm())).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(createChallenge)).not.toHaveBeenCalled()
  })

  it('allows room owners to create challenges in their room', async () => {
    vi.mocked(requireRoomOwnerById).mockResolvedValueOnce({
      membership: { role: 'OWNER' },
    } as never)
    vi.mocked(createChallenge).mockResolvedValueOnce('new-id' as never)
    await expect(createChallengeAction({}, validForm())).rejects.toThrow(
      'REDIRECT:/admin/challenges'
    )
    expect(vi.mocked(requireRoomOwnerById)).toHaveBeenCalledWith(ROOM_ID)
    expect(vi.mocked(createChallenge)).toHaveBeenCalledWith(ROOM_ID, expect.any(Object))
  })

  it('denies PLAYER update without touching the mutation', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    const form = validForm()
    form.set('id', '4b2873c8-01b9-4c22-9482-858276b94c43')
    await expect(updateChallengeAction({}, form)).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(updateChallenge)).not.toHaveBeenCalled()
  })

  it('denies PLAYER toggle without touching the mutation', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    const form = formData({ id: '4b2873c8-01b9-4c22-9482-858276b94c43', active: 'false' })
    await expect(toggleChallengeActiveAction(form)).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(setChallengeActive)).not.toHaveBeenCalled()
  })
})
