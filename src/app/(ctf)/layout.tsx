import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'
import { getPlayerScore } from '@/features/activity/queries/activityQueries'
import { getDefaultRoom } from '@/features/rooms/repositories/roomRepository'

/**
 * Authentication gate for the whole /(ctf) subtree (player pages AND /admin).
 * Role routing lives in the leaves: player pages call requirePlayer()
 * (ADMIN -> /admin) and the admin layout redirects non-admins to /challenges.
 * The gate stays here (not in the leaves) so /admin keeps working while the
 * role checks stay per-area and loop-free.
 */
export default async function CtfLayout({ children }: { children: ReactNode }) {
  const player = await requireCurrentPlayer()
  const room = await getDefaultRoom()
  const score = await getPlayerScore(player.id, room.id)

  return (
    <AppShell player={player} score={score}>
      {children}
    </AppShell>
  )
}
