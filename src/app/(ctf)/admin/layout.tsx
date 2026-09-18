import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

import { AdminNav } from './_components/AdminNav'

/**
 * Page-level admin gate with friendly redirects. Data boundaries (mutations
 * and admin read queries) still call requireAdmin() independently and fail
 * closed with 403; pages below rely on this layout guarantee for navigation.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  if (player.role !== 'ADMIN') redirect('/dashboard')
  return (
    <div className="space-y-5">
      <AdminNav />
      {children}
    </div>
  )
}
