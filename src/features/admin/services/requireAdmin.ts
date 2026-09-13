import 'server-only'

import { forbidden, redirect } from 'next/navigation'

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

/**
 * Server-side admin authorization guard.
 *
 * valid session -> load current player -> verify role === ADMIN -> allow.
 * Unauthenticated callers are redirected to /signin.
 * Authenticated non-admins are denied via forbidden().
 */
export async function requireAdmin() {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  if (player.role !== 'ADMIN') forbidden()
  return player
}
