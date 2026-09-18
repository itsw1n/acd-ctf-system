import 'server-only'

import { redirect } from 'next/navigation'

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

/**
 * Server-side player-route guard. Mirrors requireAdmin for the player area.
 *
 * valid session -> load current player -> reject ADMIN -> allow PLAYER.
 * Unauthenticated callers are redirected to /signin.
 * ADMIN accounts are redirected to /admin (player routes are PLAYER-only).
 */
export async function requirePlayer() {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  if (player.role !== 'PLAYER') redirect('/admin')
  return player
}
