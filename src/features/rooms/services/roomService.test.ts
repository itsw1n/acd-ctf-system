import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/features/rooms/repositories/roomRepository', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/rooms/repositories/roomRepository')>()
  return {
    ...actual,
    createRoomRow: vi.fn(),
    createMembership: vi.fn(),
    deleteMembership: vi.fn(),
    getMembership: vi.fn(),
    getRoomById: vi.fn(),
    getRoomByJoinCode: vi.fn(),
    getRoomTeam: vi.fn(),
    isBanned: vi.fn(),
    setJoinLockedRow: vi.fn(),
    updateJoinCodeRow: vi.fn(),
  }
})

import {
  createMembership,
  createRoomRow,
  deleteMembership,
  getMembership,
  getRoomById,
  getRoomByJoinCode,
  getRoomTeam,
  isBanned,
  setJoinLockedRow,
  updateJoinCodeRow,
} from '@/features/rooms/repositories/roomRepository'
import {
  createRoom,
  generateJoinCode,
  joinRoom,
  joinRoomByCode,
  leaveRoom,
  regenerateJoinCode,
  setJoinLocked,
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
