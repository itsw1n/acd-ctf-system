import type { ReactNode } from 'react'

import { requireAdmin } from '@/features/admin/services/requireAdmin'

import { AdminNav } from './_components/AdminNav'

/**
 * Page-level admin gate. Mutations still call requireAdmin() independently;
 * pages below rely on this structurally-certain layout guarantee.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin()
  return (
    <div className="space-y-5">
      <AdminNav />
      {children}
    </div>
  )
}
