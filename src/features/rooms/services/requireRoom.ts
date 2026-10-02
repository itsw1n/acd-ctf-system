import 'server-only'

import { forbidden, notFound, redirect } from 'next/navigation'

import {
  getRoomById,
  getRoomBySlug,
  getMembership,
} from '@/features/rooms/repositories/roomRepository'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'
import type { Room, RoomMembership } from '@/features/rooms/types'
import type { Player } from '@/features/players/types'

/**
 * Room authorization boundary. Roles come from the room membership row,
 * never from the legacy account-wide players.role column.
 */
export async function requireAccount() {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  return player
}

export async function requireRoomMember(slug: string) {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')

  const room = await getRoomBySlug(slug)
  if (!room) notFound()

  return memberInRoom(player, room, `/rooms/${slug}/join`)
}

export async function requireRoomMemberById(roomId: string) {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')

  const room = await getRoomById(roomId)
  if (!room) notFound()

  return memberInRoom(player, room, '/rooms')
}

async function memberInRoom(player: Player, room: Room, joinPath: string) {
  const membership = await getMembership(room.id, player.id)
  if (!membership) redirect(joinPath)
  if (membership.accessLocked) redirect('/signin')

  return { player, room, membership }
}

export async function requireRoomOwner(slug: string) {
  const { player, room, membership } = await requireRoomMember(slug)
  return ownerInRoom(player, room, membership)
}

export async function requireRoomOwnerById(roomId: string) {
  const { player, room, membership } = await requireRoomMemberById(roomId)
  return ownerInRoom(player, room, membership)
}

function ownerInRoom(
  player: Player,
  room: Room,
  membership: RoomMembership
) {
  if (membership.role !== 'OWNER') forbidden()
  return { player, room, membership }
}
