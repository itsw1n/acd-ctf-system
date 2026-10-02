import 'server-only'

import { randomBytes } from 'node:crypto'
import { z } from 'zod'

import {
  banMembership,
  createMembership,
  createRoomRow,
  deleteMembership,
  getMembership,
  getRoomById,
  getRoomByJoinCode,
  getRoomTeam,
  isBanned,
  listMyRooms as fetchMyRooms,
  listPublicRooms as fetchPublicRooms,
  listRoomMembers as fetchRoomMembers,
  setJoinLockedRow,
  setMemberLockedRow,
  slugifyRoomName,
  unbanMembership,
  updateJoinCodeRow,
  updateRoomRow,
} from '@/features/rooms/repositories/roomRepository'

const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateJoinCode() {
  const limit = 256 - (256 % JOIN_CODE_ALPHABET.length)
  let value = ''
  while (value.length < 6) {
    const byte = randomBytes(1)[0]
    if (byte >= limit) continue
    value += JOIN_CODE_ALPHABET[byte % JOIN_CODE_ALPHABET.length]
  }
  return `RM-${value}`
}

export const createRoomSchema = z.object({
  ownerId: z.string().uuid(),
  name: z.string().trim().min(2, 'Room name is required.').max(80),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
})

export type CreateRoomInput = z.input<typeof createRoomSchema>

export async function createRoom(input: CreateRoomInput) {
  const parsed = createRoomSchema.parse(input)
  const slug = slugifyRoomName(parsed.name)
  if (!slug) throw new Error('INVALID_NAME')

  try {
    const room = await createRoomRow({
      name: parsed.name,
      slug,
      visibility: parsed.visibility,
      joinCode: generateJoinCode(),
    })
    await createMembership({
      roomId: room.id,
      playerId: parsed.ownerId,
      role: 'OWNER',
      teamId: null,
    })
    return room
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new Error('ROOM_TAKEN')
    }
    throw error
  }
}

const joinByCodeSchema = z.object({
  playerId: z.string().uuid(),
  code: z.string().trim().min(1),
  teamId: z.string().uuid().nullable(),
})

export type JoinRoomByCodeInput = z.input<typeof joinByCodeSchema>

export async function joinRoomByCode(input: JoinRoomByCodeInput) {
  const parsed = joinByCodeSchema.parse(input)
  const room = await getRoomByJoinCode(parsed.code)
  if (!room) throw new Error('INVALID_CODE')
  return joinRoomInner(room.id, parsed.playerId, parsed.teamId, room.joinLocked)
}

const joinSchema = z.object({
  playerId: z.string().uuid(),
  roomId: z.string().uuid(),
  teamId: z.string().uuid().nullish(),
})

export type JoinRoomInput = z.input<typeof joinSchema>

export async function joinRoom(input: JoinRoomInput) {
  const parsed = joinSchema.parse(input)
  const room = await getRoomById(parsed.roomId)
  if (!room) throw new Error('ROOM_NOT_FOUND')
  if (room.visibility === 'PRIVATE') throw new Error('USE_CODE')
  return joinRoomInner(room.id, parsed.playerId, parsed.teamId ?? null, room.joinLocked)
}

async function joinRoomInner(
  roomId: string,
  playerId: string,
  teamId: string | null,
  joinLocked: boolean
) {
  if (joinLocked) throw new Error('JOIN_LOCKED')
  if (await isBanned(roomId, playerId)) throw new Error('BANNED')

  const existing = await getMembership(roomId, playerId)
  if (existing) return existing

  if (teamId) {
    const team = await getRoomTeam(teamId, roomId)
    if (!team) throw new Error('TEAM_NOT_IN_ROOM')
  }

  return createMembership({ roomId, playerId, role: 'PARTICIPANT', teamId })
}

const leaveSchema = z.object({
  playerId: z.string().uuid(),
  roomId: z.string().uuid(),
})

export async function leaveRoom(input: z.infer<typeof leaveSchema>) {
  const parsed = leaveSchema.parse(input)
  const membership = await getMembership(parsed.roomId, parsed.playerId)
  if (!membership) throw new Error('NOT_MEMBER')
  if (membership.role === 'OWNER') throw new Error('OWNER_CANNOT_LEAVE')
  await deleteMembership(parsed.roomId, parsed.playerId)
}

export async function setJoinLocked(input: { roomId: string; locked: boolean }) {
  const parsed = z.object({ roomId: z.string().uuid(), locked: z.boolean() }).parse(input)
  await setJoinLockedRow(parsed.roomId, parsed.locked)
}

const memberLockSchema = z.object({
  playerId: z.string().uuid(),
  roomId: z.string().uuid(),
  locked: z.boolean(),
})

export async function setMemberLocked(input: z.input<typeof memberLockSchema>) {
  const parsed = memberLockSchema.parse(input)
  await setMemberLockedRow(parsed.roomId, parsed.playerId, parsed.locked)
}

export async function regenerateJoinCode(input: { roomId: string }) {
  const parsed = z.object({ roomId: z.string().uuid() }).parse(input)
  const code = generateJoinCode()
  await updateJoinCodeRow(parsed.roomId, code)
  return code
}

const memberSchema = z.object({
  playerId: z.string().uuid(),
  roomId: z.string().uuid(),
})

export async function banMember(input: z.input<typeof memberSchema>) {
  const parsed = memberSchema.parse(input)
  await banMembership(parsed.roomId, parsed.playerId)
}

export async function unbanMember(input: z.input<typeof memberSchema>) {
  const parsed = memberSchema.parse(input)
  await unbanMembership(parsed.roomId, parsed.playerId)
}

const updateRoomSchema = z.object({
  roomId: z.string().uuid(),
  name: z.string().trim().min(2, 'Room name is required.').max(80).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
})

export async function updateRoom(input: z.input<typeof updateRoomSchema>) {
  const parsed = updateRoomSchema.parse(input)
  await updateRoomRow(parsed.roomId, { name: parsed.name, visibility: parsed.visibility })
}

export async function listPublicRooms() {
  return fetchPublicRooms()
}

export async function listMyRooms(playerId: string) {
  return fetchMyRooms(z.string().uuid().parse(playerId))
}

export async function listRoomMembers(roomId: string) {
  return fetchRoomMembers(z.string().uuid().parse(roomId))
}
