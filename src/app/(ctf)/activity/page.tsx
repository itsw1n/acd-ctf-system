import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: activity lives inside rooms now.
export default async function ActivityRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
