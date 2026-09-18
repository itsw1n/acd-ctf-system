import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

/**
 * Page-level admin gate with friendly redirects. Data boundaries (mutations
 * and admin read queries) still call requireAdmin() independently and fail
 * closed with 403; pages below rely on this layout guarantee for navigation.
 * Section navigation lives in the main Navigation (sidebar + mobile bar).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  if (player.role !== 'ADMIN') redirect('/dashboard')
  return <>{children}</>
}
