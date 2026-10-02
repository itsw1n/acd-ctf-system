'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  setMemberLocked,
  unbanMember,
  updateRoom,
} from '@/features/rooms/services/roomService'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

export type RoomActionState = {
  error?: string
  code?: string
}

async function requireAccountId() {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  return player.id
}

async function roomSlug(roomId: string) {
  const room = await getRoomById(roomId)
  if (!room) redirect('/rooms')
  return room.slug
}

export async function createRoomAction(
  _previous: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const ownerId = await requireAccountId()

  let slug: string
  try {
    const room = await createRoom({
      ownerId,
      name: String(formData.get('name') ?? ''),
      visibility: formData.get('visibility') === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
    })
    slug = room.slug
  } catch (error) {
    if (error instanceof Error && error.message === 'ROOM_TAKEN') {
      return { error: 'A room with a similar name already exists.' }
    }
    return { error: 'Unable to create room. Please try again.' }
  }

  redirect(`/rooms/${slug}`)
}

export async function joinRoomByCodeAction(
  _previous: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const playerId = await requireAccountId()
  const teamValue = formData.get('teamId')

  let roomId: string
  try {
    const membership = await joinRoomByCode({
      playerId,
      code: String(formData.get('code') ?? ''),
      teamId: typeof teamValue === 'string' && teamValue ? teamValue : null,
    })
    roomId = membership.roomId
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CODE') {
      return { error: 'Unknown join code. Check the value and try again.' }
    }
    if (error instanceof Error && error.message === 'JOIN_LOCKED') {
      return { error: 'This room is locked and not accepting new members.' }
    }
    if (error instanceof Error && error.message === 'BANNED') {
      return { error: 'You cannot join this room.' }
    }
    if (error instanceof Error && error.message === 'TEAM_NOT_IN_ROOM') {
      return { error: 'Selected team does not belong to this room.' }
    }
    return { error: 'Unable to join room. Please try again.' }
  }

  redirect(`/rooms/${await roomSlug(roomId)}`)
}

export async function joinRoomAction(
  roomId: string,
  _previous: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const playerId = await requireAccountId()
  const teamValue = formData.get('teamId')

  try {
    await joinRoom({
      playerId,
      roomId,
      teamId: typeof teamValue === 'string' && teamValue ? teamValue : null,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'USE_CODE') {
      return { error: 'This room is private. Join with its code instead.' }
    }
    if (error instanceof Error && error.message === 'JOIN_LOCKED') {
      return { error: 'This room is locked and not accepting new members.' }
    }
    if (error instanceof Error && error.message === 'BANNED') {
      return { error: 'You cannot join this room.' }
    }
    return { error: 'Unable to join room. Please try again.' }
  }

  redirect(`/rooms/${await roomSlug(roomId)}`)
}

export async function leaveRoomAction(roomId: string) {
  const { player } = await requireRoomMemberById(roomId)
  await leaveRoom({ playerId: player.id, roomId })
  redirect('/rooms')
}

export async function setJoinLockedAction(roomId: string, formData: FormData) {
  await requireRoomOwnerById(roomId)
  await setJoinLocked({ roomId, locked: formData.get('locked') === 'true' })
  revalidatePath(`/rooms/${roomId}`)
}

export async function setMemberLockedAction(roomId: string, formData: FormData) {
  await requireRoomOwnerById(roomId)
  const playerId = formData.get('playerId')
  if (typeof playerId !== 'string' || !playerId) return
  await setMemberLocked({ roomId, playerId, locked: formData.get('locked') === 'true' })
  revalidatePath(`/rooms/${roomId}`)
}

export async function regenerateJoinCodeAction(roomId: string): Promise<RoomActionState> {
  await requireRoomOwnerById(roomId)
  const code = await regenerateJoinCode({ roomId })
  revalidatePath(`/rooms/${roomId}`)
  return { code }
}

export async function banMemberAction(roomId: string, formData: FormData) {
  await requireRoomOwnerById(roomId)
  const playerId = formData.get('playerId')
  if (typeof playerId !== 'string' || !playerId) return
  await banMember({ roomId, playerId })
  revalidatePath(`/rooms/${roomId}`)
}

export async function unbanMemberAction(roomId: string, formData: FormData) {
  await requireRoomOwnerById(roomId)
  const playerId = formData.get('playerId')
  if (typeof playerId !== 'string' || !playerId) return
  await unbanMember({ roomId, playerId })
  revalidatePath(`/rooms/${roomId}`)
}

export async function updateRoomAction(
  roomId: string,
  _previous: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  await requireRoomOwnerById(roomId)

  try {
    await updateRoom({
      roomId,
      name: String(formData.get('name') ?? ''),
      visibility: formData.get('visibility') === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
    })
  } catch {
    return { error: 'Unable to update room. Please try again.' }
  }

  revalidatePath(`/rooms/${roomId}`)
  return {}
}
