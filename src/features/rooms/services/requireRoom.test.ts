import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/sessions/services/sessionService', () => ({
  getCurrentPlayer: vi.fn(),
}))

vi.mock('@/features/rooms/repositories/roomRepository', () => ({
  getRoomBySlug: vi.fn(),
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
import { getMembership, getRoomBySlug } from '@/features/rooms/repositories/roomRepository'
import { requireAccount, requireRoomMember, requireRoomOwner } from '@/features/rooms/services/requireRoom'
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
