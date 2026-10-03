import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: challenges live inside rooms now.
export default async function ChallengesRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
