import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/sessions/services/sessionService', () => ({
  getCurrentPlayer: vi.fn(),
}))

vi.mock('@/features/rooms/services/requireRoom', () => ({
  requireRoomMemberById: vi.fn(),
  requireRoomOwnerById: vi.fn(),
}))

vi.mock('@/features/rooms/repositories/roomRepository', () => ({
  getRoomById: vi.fn(),
}))

vi.mock('@/features/rooms/services/roomService', () => ({
  banMember: vi.fn(),
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
  joinRoomByCode: vi.fn(),
  leaveRoom: vi.fn(),
  regenerateJoinCode: vi.fn(),
  setJoinLocked: vi.fn(),
  unbanMember: vi.fn(),
  updateRoom: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'
import { getRoomById } from '@/features/rooms/repositories/roomRepository'
import { requireRoomMemberById, requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import {
  banMember,
  createRoom,
  joinRoom,
  joinRoomByCode,
  leaveRoom,
  regenerateJoinCode,
  setJoinLocked,
  unbanMember,
  updateRoom,
} from '@/features/rooms/services/roomService'
import {
  banMemberAction,
  createRoomAction,
  joinRoomAction,
  joinRoomByCodeAction,
  leaveRoomAction,
  regenerateJoinCodeAction,
  setJoinLockedAction,
  setMemberLockedAction,
  unbanMemberAction,
  updateRoomAction,
} from '@/features/rooms/actions/roomActions'

const ROOM_ID = '22222222-2222-4222-8222-222222222222'
const PLAYER_ID = '11111111-1111-4111-8111-111111111111'
const TEAM_ID = '33333333-3333-4333-8333-333333333333'

function formData(entries: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(entries)) form.set(key, value)
  return form
}

describe('room actions authorization', () => {
  beforeEach(() => vi.clearAllMocks())

  it('denies room creation for guests', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(createRoomAction({}, formData({ name: 'X' }))).rejects.toThrow('REDIRECT:/signin')
    expect(vi.mocked(createRoom)).not.toHaveBeenCalled()
  })

  it('creates rooms for signed-in users and redirects to them', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce({ id: PLAYER_ID } as never)
    vi.mocked(createRoom).mockResolvedValueOnce({ id: ROOM_ID, slug: 'my-room' } as never)
    await expect(createRoomAction({}, formData({ name: 'My Room' }))).rejects.toThrow(
      'REDIRECT:/rooms/my-room'
    )
    expect(vi.mocked(createRoom)).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: PLAYER_ID, name: 'My Room' })
    )
  })

  it('denies joining for guests', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(joinRoomByCodeAction({}, formData({ code: 'RM-ABCDEF' }))).rejects.toThrow(
      'REDIRECT:/signin'
    )
    expect(vi.mocked(joinRoomByCode)).not.toHaveBeenCalled()
  })

  it('joins by code and redirects to the room', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce({ id: PLAYER_ID } as never)
    vi.mocked(joinRoomByCode).mockResolvedValueOnce({ roomId: ROOM_ID } as never)
    vi.mocked(getRoomById).mockResolvedValueOnce({ id: ROOM_ID, slug: 'my-room' } as never)
    await expect(
      joinRoomByCodeAction({}, formData({ code: 'RM-ABCDEF', teamId: TEAM_ID }))
    ).rejects.toThrow('REDIRECT:/rooms/my-room')
  })

  it('denies direct joins for guests', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(joinRoomAction(ROOM_ID, {}, formData({}))).rejects.toThrow('REDIRECT:/signin')
    expect(vi.mocked(joinRoom)).not.toHaveBeenCalled()
  })

  it('denies leaving for non-members', async () => {
    vi.mocked(requireRoomMemberById).mockRejectedValueOnce(new Error('REDIRECT:/rooms'))
    await expect(leaveRoomAction(ROOM_ID, {})).rejects.toThrow('REDIRECT:/rooms')
    expect(vi.mocked(leaveRoom)).not.toHaveBeenCalled()
  })

  it('leaves and redirects to the room list', async () => {
    vi.mocked(requireRoomMemberById).mockResolvedValueOnce({
      player: { id: PLAYER_ID },
      membership: { role: 'PARTICIPANT' },
    } as never)
    await expect(leaveRoomAction(ROOM_ID, {})).rejects.toThrow('REDIRECT:/rooms')
    expect(vi.mocked(leaveRoom)).toHaveBeenCalledWith({ playerId: PLAYER_ID, roomId: ROOM_ID })
  })

  it('denies lock changes for non-owners', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(setJoinLockedAction(ROOM_ID, formData({ locked: 'true' }))).rejects.toThrow(
      'FORBIDDEN'
    )
    expect(vi.mocked(setJoinLocked)).not.toHaveBeenCalled()
  })

  it('denies bans for non-owners', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(banMemberAction(ROOM_ID, formData({ playerId: PLAYER_ID }))).rejects.toThrow(
      'FORBIDDEN'
    )
    expect(vi.mocked(banMember)).not.toHaveBeenCalled()
  })

  it('denies unbans for non-owners', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(unbanMemberAction(ROOM_ID, formData({ playerId: PLAYER_ID }))).rejects.toThrow(
      'FORBIDDEN'
    )
    expect(vi.mocked(unbanMember)).not.toHaveBeenCalled()
  })

  it('denies settings changes for non-owners', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(updateRoomAction(ROOM_ID, {}, formData({ name: 'X' }))).rejects.toThrow(
      'FORBIDDEN'
    )
    expect(vi.mocked(updateRoom)).not.toHaveBeenCalled()
  })

  it('returns regenerated codes for owners', async () => {
    vi.mocked(requireRoomOwnerById).mockResolvedValueOnce({
      membership: { role: 'OWNER' },
    } as never)
    vi.mocked(regenerateJoinCode).mockResolvedValueOnce('RM-NEWC0D')
    await expect(regenerateJoinCodeAction(ROOM_ID, {})).resolves.toMatchObject({
      code: 'RM-NEWC0D',
    })
  })
})

describe('member lock authorization', () => {
  beforeEach(() => vi.clearAllMocks())

  it('denies lock changes for non-owners', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(
      setMemberLockedAction(
        '22222222-2222-4222-8222-222222222222',
        (() => {
          const form = new FormData()
          form.set('playerId', '11111111-1111-4111-8111-111111111111')
          form.set('locked', 'true')
          return form
        })()
      )
    ).rejects.toThrow('FORBIDDEN')
  })
})
