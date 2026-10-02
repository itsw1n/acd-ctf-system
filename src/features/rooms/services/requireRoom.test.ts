import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/sessions/services/sessionService', () => ({
  getCurrentPlayer: vi.fn(),
}))

vi.mock('@/features/rooms/repositories/roomRepository', () => ({
  getRoomBySlug: vi.fn(),
  getRoomById: vi.fn(),
  getMembership: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
  forbidden: () => {
    throw new Error('FORBIDDEN')
  },
  notFound: () => {
    throw new Error('NOTFOUND')
  },
}))

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'
import { getMembership, getRoomById, getRoomBySlug } from '@/features/rooms/repositories/roomRepository'
import {
  requireAccount,
  requireRoomMember,
  requireRoomMemberById,
  requireRoomOwner,
  requireRoomOwnerById,
} from '@/features/rooms/services/requireRoom'
import type { Player } from '@/features/players/types'

function player(): Player {
  return {
    id: 'player-1',
    fullName: 'Test User',
    alias: 'tester',
    role: 'PLAYER',
    team: null,
  } as Player
}

function room() {
  return { id: 'room-1', slug: 'test-room', name: 'Test Room' } as never
}

function membership(role: 'OWNER' | 'PARTICIPANT', locked = false) {
  return { roomId: 'room-1', playerId: 'player-1', role, accessLocked: locked } as never
}

describe('requireAccount', () => {
  it('redirects guests to /signin', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(requireAccount()).rejects.toThrow('REDIRECT:/signin')
  })

  it('returns the signed-in player', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    await expect(requireAccount()).resolves.toMatchObject({ id: 'player-1' })
  })
})

describe('requireRoomMember', () => {
  it('redirects guests to /signin', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(requireRoomMember('test-room')).rejects.toThrow('REDIRECT:/signin')
  })

  it('returns 404 for an unknown room slug', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomBySlug).mockResolvedValueOnce(null)
    await expect(requireRoomMember('nope')).rejects.toThrow('NOTFOUND')
  })

  it('redirects non-members to the join page', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomBySlug).mockResolvedValueOnce(room())
    vi.mocked(getMembership).mockResolvedValueOnce(null)
    await expect(requireRoomMember('test-room')).rejects.toThrow(
      'REDIRECT:/rooms/test-room/join'
    )
  })

  it('redirects locked members to /signin', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomBySlug).mockResolvedValueOnce(room())
    vi.mocked(getMembership).mockResolvedValueOnce(membership('PARTICIPANT', true))
    await expect(requireRoomMember('test-room')).rejects.toThrow('REDIRECT:/signin')
  })

  it('returns player, room, and membership for members', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomBySlug).mockResolvedValueOnce(room())
    vi.mocked(getMembership).mockResolvedValueOnce(membership('PARTICIPANT'))
    await expect(requireRoomMember('test-room')).resolves.toMatchObject({
      room: { slug: 'test-room' },
      membership: { role: 'PARTICIPANT' },
    })
  })
})

describe('requireRoomMemberById / requireRoomOwnerById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves members without a slug lookup', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomById).mockResolvedValueOnce(room())
    vi.mocked(getMembership).mockResolvedValueOnce(membership('PARTICIPANT'))
    await expect(
      requireRoomMemberById('22222222-2222-4222-8222-222222222222')
    ).resolves.toMatchObject({ membership: { role: 'PARTICIPANT' } })
    expect(vi.mocked(getRoomBySlug)).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown room id', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomById).mockResolvedValueOnce(null)
    await expect(
      requireRoomOwnerById('22222222-2222-4222-8222-222222222222')
    ).rejects.toThrow('NOTFOUND')
  })

  it('denies participating non-owners by id', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomById).mockResolvedValueOnce(room())
    vi.mocked(getMembership).mockResolvedValueOnce(membership('PARTICIPANT'))
    await expect(
      requireRoomOwnerById('22222222-2222-4222-8222-222222222222')
    ).rejects.toThrow('FORBIDDEN')
  })
})

describe('requireRoomOwner', () => {
  it('redirects guests to /signin', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(null)
    await expect(requireRoomOwner('test-room')).rejects.toThrow('REDIRECT:/signin')
  })

  it('denies participating non-owners', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomBySlug).mockResolvedValueOnce(room())
    vi.mocked(getMembership).mockResolvedValueOnce(membership('PARTICIPANT'))
    await expect(requireRoomOwner('test-room')).rejects.toThrow('FORBIDDEN')
  })

  it('allows the owner', async () => {
    vi.mocked(getCurrentPlayer).mockResolvedValueOnce(player())
    vi.mocked(getRoomBySlug).mockResolvedValueOnce(room())
    vi.mocked(getMembership).mockResolvedValueOnce(membership('OWNER'))
    await expect(requireRoomOwner('test-room')).resolves.toMatchObject({
      membership: { role: 'OWNER' },
    })
  })
})
