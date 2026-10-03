import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/features/teams/repositories/teamRepository', () => ({
  listTeamsAdmin: vi.fn(),
}))

vi.mock('@/features/rooms/repositories/roomRepository', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/rooms/repositories/roomRepository')>()
  return {
    ...actual,
    getRoomJoinCodeRow: vi.fn(),
    createRoomRow: vi.fn(),
    createMembership: vi.fn(),
    deleteMembership: vi.fn(),
    deleteRoomRow: vi.fn(),
    getMembership: vi.fn(),
    getRoomById: vi.fn(),
    getRoomByJoinCode: vi.fn(),
    getRoomTeam: vi.fn(),
    isBanned: vi.fn(),
    setJoinLockedRow: vi.fn(),
    setMemberLockedRow: vi.fn(),
    updateJoinCodeRow: vi.fn(),
    banMembership: vi.fn(),
    unbanMembership: vi.fn(),
    updateRoomRow: vi.fn(),
    listBannedMembers: vi.fn(),
    listMyRooms: vi.fn(),
    listPublicRooms: vi.fn(),
    listRoomMembers: vi.fn(),
  }
})

import { listTeamsAdmin } from '@/features/teams/repositories/teamRepository'
import {
  banMembership,
  createMembership,
  createRoomRow,
  deleteMembership,
  deleteRoomRow,
  getMembership,
  getRoomById,
  getRoomByJoinCode,
  getRoomJoinCodeRow,
  getRoomTeam,
  isBanned,
  listBannedMembers as listBannedMembersRepo,
  listMyRooms as listMyRoomsRepo,
  listPublicRooms as listPublicRoomsRepo,
  listRoomMembers as listRoomMembersRepo,
  setJoinLockedRow,
  setMemberLockedRow,
  unbanMembership,
  updateJoinCodeRow,
  updateRoomRow,
} from '@/features/rooms/repositories/roomRepository'
import {
  banMember,
  createRoom,
  deleteRoom,
  generateJoinCode,
  getJoinPreview,
  getRoomJoinCode,
  joinRoom,
  joinRoomByCode,
  leaveRoom,
  listBannedMembers,
  listMyRooms,
  listPublicRooms,
  listRoomMembers,
  regenerateJoinCode,
  setJoinLocked,
  setMemberLocked,
  unbanMember,
  updateRoom,
} from '@/features/rooms/services/roomService'

function room(overrides: Record<string, unknown> = {}) {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'test-room',
    name: 'Test Room',
    visibility: 'PUBLIC',
    joinLocked: false,
    ...overrides,
  } as never
}

describe('generateJoinCode', () => {
  it('produces RM-prefixed unambiguous codes', () => {
    expect(generateJoinCode()).toMatch(/^RM-[A-Z2-9]{6}$/)
  })

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateJoinCode()))
    expect(codes.size).toBe(50)
  })
})

describe('createRoom', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates the room and makes the creator its owner', async () => {
    vi.mocked(createRoomRow).mockResolvedValueOnce(room())

    const created = await createRoom({
      ownerId: '11111111-1111-4111-8111-111111111111',
      name: 'Test Room',
    })

    expect(created).toMatchObject({ slug: 'test-room' })
    expect(vi.mocked(createRoomRow)).toHaveBeenCalledWith(
      expect.objectContaining({ visibility: 'PUBLIC' })
    )
    expect(vi.mocked(createMembership)).toHaveBeenCalledWith({
      roomId: '22222222-2222-4222-8222-222222222222',
      playerId: '11111111-1111-4111-8111-111111111111',
      role: 'OWNER',
      teamId: null,
    })
  })

  it('rejects blank names without touching the database', async () => {
    await expect(
      createRoom({ ownerId: '11111111-1111-4111-8111-111111111111', name: '  ' })
    ).rejects.toThrow()
    expect(vi.mocked(createRoomRow)).not.toHaveBeenCalled()
  })

  it('maps slug conflicts to ROOM_TAKEN', async () => {
    vi.mocked(createRoomRow).mockRejectedValueOnce(
      Object.assign(new Error('dup'), { code: '23505' })
    )
    await expect(
      createRoom({ ownerId: '11111111-1111-4111-8111-111111111111', name: 'Test Room' })
    ).rejects.toThrow('ROOM_TAKEN')
  })
})

describe('joinRoomByCode', () => {
  beforeEach(() => vi.clearAllMocks())

  function memberSetup() {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce(room({ visibility: 'PRIVATE' }))
    vi.mocked(isBanned).mockResolvedValueOnce(false)
    vi.mocked(getMembership).mockResolvedValueOnce(null)
    vi.mocked(getRoomTeam).mockResolvedValueOnce({
      id: '33333333-3333-4333-8333-333333333333',
    } as never)
    vi.mocked(createMembership).mockResolvedValueOnce({ role: 'PARTICIPANT' } as never)
  }

  it('joins with a valid code as participant', async () => {
    memberSetup()
    const membership = await joinRoomByCode({
      playerId: '11111111-1111-4111-8111-111111111111',
      code: 'RM-ABCDEF',
      teamId: '33333333-3333-4333-8333-333333333333',
    })
    expect(membership).toMatchObject({ role: 'PARTICIPANT' })
    expect(vi.mocked(createMembership)).toHaveBeenCalledWith({
      roomId: '22222222-2222-4222-8222-222222222222',
      playerId: '11111111-1111-4111-8111-111111111111',
      role: 'PARTICIPANT',
      teamId: '33333333-3333-4333-8333-333333333333',
    })
  })

  it('rejects unknown codes', async () => {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce(null)
    await expect(
      joinRoomByCode({
        playerId: '11111111-1111-4111-8111-111111111111',
        code: 'RM-NOPE12',
        teamId: null,
      })
    ).rejects.toThrow('INVALID_CODE')
  })

  it('rejects joins while the room is locked', async () => {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce(room({ joinLocked: true }))
    await expect(
      joinRoomByCode({
        playerId: '11111111-1111-4111-8111-111111111111',
        code: 'RM-ABCDEF',
        teamId: null,
      })
    ).rejects.toThrow('JOIN_LOCKED')
  })

  it('rejects banned players', async () => {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce(room())
    vi.mocked(isBanned).mockResolvedValueOnce(true)
    await expect(
      joinRoomByCode({
        playerId: '11111111-1111-4111-8111-111111111111',
        code: 'RM-ABCDEF',
        teamId: null,
      })
    ).rejects.toThrow('BANNED')
  })

  it('rejects teams from another room', async () => {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce(room())
    vi.mocked(isBanned).mockResolvedValueOnce(false)
    vi.mocked(getMembership).mockResolvedValueOnce(null)
    vi.mocked(getRoomTeam).mockResolvedValueOnce(null)
    await expect(
      joinRoomByCode({
        playerId: '11111111-1111-4111-8111-111111111111',
        code: 'RM-ABCDEF',
        teamId: '44444444-4444-4433-8444-444444444444',
      })
    ).rejects.toThrow('TEAM_NOT_IN_ROOM')
  })

  it('is idempotent for existing members', async () => {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce(room())
    vi.mocked(isBanned).mockResolvedValueOnce(false)
    vi.mocked(getMembership).mockResolvedValueOnce({ role: 'PARTICIPANT' } as never)
    const membership = await joinRoomByCode({
      playerId: '11111111-1111-4111-8111-111111111111',
      code: 'RM-ABCDEF',
      teamId: null,
    })
    expect(membership).toMatchObject({ role: 'PARTICIPANT' })
    expect(vi.mocked(createMembership)).not.toHaveBeenCalled()
  })
})

describe('joinRoom', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects joining a private room without a code', async () => {
    vi.mocked(getRoomById).mockResolvedValueOnce(room({ visibility: 'PRIVATE' }))
    await expect(
      joinRoom({
        playerId: '11111111-1111-4111-8111-111111111111',
        roomId: '22222222-2222-4222-8222-222222222222',
      })
    ).rejects.toThrow('USE_CODE')
  })

  it('joins public rooms directly', async () => {
    vi.mocked(getRoomById).mockResolvedValueOnce(room())
    vi.mocked(isBanned).mockResolvedValueOnce(false)
    vi.mocked(getMembership).mockResolvedValueOnce(null)
    vi.mocked(createMembership).mockResolvedValueOnce({ role: 'PARTICIPANT' } as never)
    await expect(
      joinRoom({
        playerId: '11111111-1111-4111-8111-111111111111',
        roomId: '22222222-2222-4222-8222-222222222222',
      })
    ).resolves.toMatchObject({ role: 'PARTICIPANT' })
  })
})

describe('leaveRoom', () => {
  beforeEach(() => vi.clearAllMocks())

  it('removes a participant membership', async () => {
    vi.mocked(getMembership).mockResolvedValueOnce({ role: 'PARTICIPANT' } as never)
    await leaveRoom({
      playerId: '11111111-1111-4111-8111-111111111111',
      roomId: '22222222-2222-4222-8222-222222222222',
    })
    expect(vi.mocked(deleteMembership)).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111'
    )
  })

  it('rejects leaving for non-members', async () => {
    vi.mocked(getMembership).mockResolvedValueOnce(null)
    await expect(
      leaveRoom({
        playerId: '11111111-1111-4111-8111-111111111111',
        roomId: '22222222-2222-4222-8222-222222222222',
      })
    ).rejects.toThrow('NOT_MEMBER')
  })

  it('rejects the owner leaving so rooms are never orphaned', async () => {
    vi.mocked(getMembership).mockResolvedValueOnce({ role: 'OWNER' } as never)
    await expect(
      leaveRoom({
        playerId: '11111111-1111-4111-8111-111111111111',
        roomId: '22222222-2222-4222-8222-222222222222',
      })
    ).rejects.toThrow('OWNER_CANNOT_LEAVE')
    expect(vi.mocked(deleteMembership)).not.toHaveBeenCalled()
  })
})

describe('setJoinLocked and regenerateJoinCode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('persists the lock flag', async () => {
    await setJoinLocked({ roomId: '22222222-2222-4222-8222-222222222222', locked: true })
    expect(vi.mocked(setJoinLockedRow)).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      true
    )
  })

  it('returns a fresh code', async () => {
    vi.mocked(updateJoinCodeRow).mockResolvedValueOnce(undefined)
    const code = await regenerateJoinCode({ roomId: '22222222-2222-4222-8222-222222222222' })
    expect(code).toMatch(/^RM-[A-Z2-9]{6}$/)
    expect(vi.mocked(updateJoinCodeRow)).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      code
    )
  })
})

describe('getJoinPreview', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null for unknown codes', async () => {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce(null)
    await expect(getJoinPreview('RM-NOPE12')).resolves.toBeNull()
  })

  it('returns the room with its teams for valid codes', async () => {
    vi.mocked(getRoomByJoinCode).mockResolvedValueOnce({
      id: '22222222-2222-4222-8222-222222222222',
      slug: 'test-room',
    } as never)
    vi.mocked(listTeamsAdmin).mockResolvedValueOnce([{ id: 't1', name: 'Ops' }] as never)
    await expect(getJoinPreview('RM-ABCDEF')).resolves.toMatchObject({
      room: { slug: 'test-room' },
      teams: [{ id: 't1', name: 'Ops' }],
    })
  })
})

describe('getRoomJoinCode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the code for owners to share', async () => {
    vi.mocked(getRoomJoinCodeRow).mockResolvedValueOnce('RM-ABCDEF')
    await expect(getRoomJoinCode('22222222-2222-4222-8222-222222222222')).resolves.toBe('RM-ABCDEF')
  })
})

describe('getRoomPath', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves the canonical room path', async () => {
    vi.mocked(getRoomById).mockResolvedValueOnce({ slug: 'my-room' } as never)
    await expect(
      (await import('@/features/rooms/services/roomService')).getRoomPath(
        '22222222-2222-4222-8222-222222222222'
      )
    ).resolves.toBe('/rooms/my-room')
  })
})

describe('banMember and unbanMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('refuses to ban the room owner', async () => {
    vi.mocked(getMembership).mockResolvedValueOnce({ role: 'OWNER' } as never)
    await expect(
      banMember({
        playerId: '11111111-1111-4111-8111-111111111111',
        roomId: '22222222-2222-4222-8222-222222222222',
      })
    ).rejects.toThrow('OWNER_CANNOT_BAN')
    expect(vi.mocked(banMembership)).not.toHaveBeenCalled()
  })

  it('removes the membership and records the ban', async () => {
    vi.mocked(getMembership).mockResolvedValueOnce({ role: 'PARTICIPANT' } as never)
    await banMember({
      playerId: '11111111-1111-4111-8111-111111111111',
      roomId: '22222222-2222-4222-8222-222222222222',
    })
    expect(vi.mocked(banMembership)).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111'
    )
  })

  it('lifts bans', async () => {
    await unbanMember({
      playerId: '11111111-1111-4111-8111-111111111111',
      roomId: '22222222-2222-4222-8222-222222222222',
    })
    expect(vi.mocked(unbanMembership)).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111'
    )
  })
})

describe('updateRoom', () => {
  beforeEach(() => vi.clearAllMocks())

  it('patches name and visibility', async () => {
    await updateRoom({
      roomId: '22222222-2222-4222-8222-222222222222',
      name: 'New Name',
      visibility: 'PRIVATE',
    })
    expect(vi.mocked(updateRoomRow)).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      expect.objectContaining({ name: 'New Name', visibility: 'PRIVATE' })
    )
  })

  it('rejects blank names without touching the database', async () => {
    await expect(
      updateRoom({ roomId: '22222222-2222-4222-8222-222222222222', name: '  ' })
    ).rejects.toThrow()
    expect(vi.mocked(updateRoomRow)).not.toHaveBeenCalled()
  })
})

describe('room listings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists public rooms', async () => {
    vi.mocked(listPublicRoomsRepo).mockResolvedValueOnce([{ slug: 'open-room' }] as never)
    await expect(listPublicRooms()).resolves.toEqual([{ slug: 'open-room' }])
  })

  it('lists rooms the player belongs to', async () => {
    vi.mocked(listMyRoomsRepo).mockResolvedValueOnce([{ role: 'OWNER' }] as never)
    await expect(listMyRooms('11111111-1111-4111-8111-111111111111')).resolves.toEqual([
      { role: 'OWNER' },
    ])
  })

  it('lists members with display data', async () => {
    vi.mocked(listRoomMembersRepo).mockResolvedValueOnce([{ alias: 'tester' }] as never)
    await expect(listRoomMembers('22222222-2222-4222-8222-222222222222')).resolves.toEqual([
      { alias: 'tester' },
    ])
  })

  it('lists banned players with display data', async () => {
    vi.mocked(listBannedMembersRepo).mockResolvedValueOnce([{ alias: 'griefer' }] as never)
    await expect(listBannedMembers('22222222-2222-4222-8222-222222222222')).resolves.toEqual([
      { alias: 'griefer' },
    ])
  })
})

describe('setMemberLocked', () => {
  beforeEach(() => vi.clearAllMocks())

  it('persists the member lock flag', async () => {
    await setMemberLocked({
      roomId: '22222222-2222-4222-8222-222222222222',
      playerId: '11111111-1111-4111-8111-111111111111',
      locked: true,
    })
    expect(vi.mocked(setMemberLockedRow)).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111',
      true
    )
  })
})

describe('deleteRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects when the typed name does not match', async () => {
    vi.mocked(getRoomById).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      slug: 'alpha',
      name: 'Alpha',
      visibility: 'PUBLIC',
      joinLocked: false,
    })
    await expect(
      deleteRoom({ roomId: '11111111-1111-4111-8111-111111111111', expectedName: 'Beta' })
    ).rejects.toThrow('NAME_MISMATCH')
    expect(deleteRoomRow).not.toHaveBeenCalled()
  })

  it('rejects the default room', async () => {
    vi.mocked(getRoomById).mockResolvedValue({
      id: '22222222-2222-4222-8222-222222222222',
      slug: 'acd-ctf',
      name: 'ACD CTF',
      visibility: 'PUBLIC',
      joinLocked: false,
    })
    await expect(
      deleteRoom({ roomId: '22222222-2222-4222-8222-222222222222', expectedName: 'ACD CTF' })
    ).rejects.toThrow('DEFAULT_ROOM_PROTECTED')
    expect(deleteRoomRow).not.toHaveBeenCalled()
  })

  it('rejects when the room is missing', async () => {
    vi.mocked(getRoomById).mockResolvedValue(null)
    await expect(
      deleteRoom({ roomId: '33333333-3333-4333-8333-333333333333', expectedName: 'Alpha' })
    ).rejects.toThrow('ROOM_NOT_FOUND')
  })

  it('deletes on exact match', async () => {
    vi.mocked(getRoomById).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      slug: 'alpha',
      name: 'Alpha',
      visibility: 'PUBLIC',
      joinLocked: false,
    })
    await deleteRoom({ roomId: '11111111-1111-4111-8111-111111111111', expectedName: 'Alpha' })
    expect(deleteRoomRow).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111')
  })
})
