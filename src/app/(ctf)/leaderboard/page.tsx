import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: leaderboards live inside rooms now.
export default async function LeaderboardRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
