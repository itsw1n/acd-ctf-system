import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: solve logs live under /rooms/[slug]/admin/solves now.
export default async function AdminSolvesRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
