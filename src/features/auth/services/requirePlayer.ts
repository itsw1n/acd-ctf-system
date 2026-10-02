import 'server-only'

import { redirect } from 'next/navigation'

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

/**
 * Server-side account guard for signed-in areas (profile, rooms entry).
 * Any authenticated account with a usable session passes; room-level
 * authorization happens in requireRoomMember / requireRoomOwner.
 * Unauthenticated callers are redirected to /signin.
 */
export async function requirePlayer() {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  if (player.accessLocked) redirect('/signin')
  return player
}
