import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: rooms replaced the single global board.
export default async function DashboardRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
