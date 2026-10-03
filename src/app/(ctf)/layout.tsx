import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

/**
 * Authentication gate for the whole /(ctf) subtree. Scores are per room,
 * so the shell renders without a score and each room page shows its own.
 */
export default async function CtfLayout({ children }: { children: ReactNode }) {
  const player = await requireCurrentPlayer()

  return (
    <AppShell player={player} score={null}>
      {children}
    </AppShell>
  )
}
