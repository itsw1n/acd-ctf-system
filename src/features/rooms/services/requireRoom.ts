import 'server-only'

import { forbidden, notFound, redirect } from 'next/navigation'

import { getRoomBySlug, getMembership } from '@/features/rooms/repositories/roomRepository'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

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

  const membership = await getMembership(room.id, player.id)
  if (!membership) redirect(`/rooms/${slug}/join`)
  if (membership.accessLocked) redirect('/signin')

  return { player, room, membership }
}

export async function requireRoomOwner(slug: string) {
  const { player, room, membership } = await requireRoomMember(slug)
  if (membership.role !== 'OWNER') forbidden()
  return { player, room, membership }
}
